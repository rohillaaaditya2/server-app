//routes/inventoryActions.js
const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const Inventory=require('./Inventory.model.js');
const Product = require('../product/product.model.js');
const inventoryModel = require('./Inventory.model.js');
 

//-----HELPER TO COERCE NUMBER----

const toNum = v => (typeof v === 'number' ? v : Number(v));

//----------------------------------
// 1) HELPER: CREATE INVENTRY WHEN VENDORS ADDS PRODUCT
//    USE THIS FUNCTION FROM YOUR PRODUCT CREATION CONTROLLER AFTER PRODUCT IS SAVED.
//    E.G. CONST INV = AWAIT CREATEINVENTORYFORNEWPRODUCT(NEWPRODUCT.PID, NEWPRODUCT.VID, INITIALSTOCK);
//----------------------------------

async function createInventoryForNewProduct(pid, vid, initialStock=0, opts={}){
    try{
        if(!pid || !vid) throw new Error('pid and vid required');

        //ENSURE PRODUCT EXISTS
        
        const product=await Product.findOne({pid:toNum(pid)});
        if(!product) throw new Error(`Product pid ${pid} not found`);

                     // AVOID DUPLICATE INVENTRY FOR PID + VID

        const existing= await Inventory.findOne({ pid:toNum(pid), vid:toNum(vid)});
        if(existing){

                // OPTIONALLY UPDATE STOCK IF INITIAL STOCK IS PROVIDED
            
                if(initialStock && initialStock>0){
                existing.stock=existing.stock + toNum(initialStock);
                if(opts.updatedBy) existing.updatedBy=opts.updatedBy;
                await existing.save();
            }
            return existing;
        }
        const inv=new Inventory({
            pid:toNum(pid),
            vid:toNum(vid),   
            stock:toNum(initialStock) || 0,
            reserved:0,
            soldCount:0,
            threshold:opts.threshold ?? 5,
            updatedBy: opts.updatedBy || null,
        });
        await inv.save();
        return inv;
    }catch(err){

      // BUBBLE UP ERROR SO CALLER CAN DECIDE
      
        throw err;
    }
}

// EXPORT HELPER FOR USE IN PRODUCT CONTROLLER

module.exports.createInventoryForNewProduct=createInventoryForNewProduct;

//----------------------------------------
// 2) ROUTE: VNDOR UPDATES STOCK (INCREMENTS OR SETS)
//    - PATCH /API/INVENTORY/:PID/VENDOR/:VID/STOCK
//----------------------------------------

router.patch('/pid/:pid/vendor/:vid/stock', async(req,res)=>{
    try{
        const pid= toNum(req.params.pid);
        const vid=toNum(req.params.vid);

        //====AUTH CHECK (implement in your app) ====
        const user=req.user || {}; //e.g., populated by auth middleware
        if(!user) return res.status(401).json({message:'Unauthorized'});

        if(user.role==='vendor' && Number(user.vid)!==vid){
            return res.status(403).json({message:'Forbidden - cannot modify another vendor inventory'});
        }

        const mode= (req.query.mode || 'inc').toLowerCase();

        if(mode==='set'){
            const stockVal=Number(req.body.stock);
            if(!Number.isFinite(stockVal) || stockVal<0) return res.status(400)
                .json({message:'stock must be>=0'});

            const inv=await Inventory.findOneAndUpdate(
                {pid,vid},
                {$set:{stock:stockVal, updatedAt: new Date(), updatedBy:user.username || user.id ||null}},
                {new:true}
            );
            if(!inv) return res.status(404).json({message:'Inventory not found'});
            return res.json(inv);
        }else{
            const delta=Number(req.body.delta);
            if(!Number.isFinite(delta)) return res.status(400).json({message:'delta(number) required'});

            const inv=await Inventory.findOneAndUpdate(
                {pid,vid},
                {$inc:{stock:delta}, $set:{ updatedAt: new Date(), updatedBy:user.username || user.id ||null}},
                {new:true}
            );
            if(!inv) return res.status(404).json({message:'Inventory not found'});
            if(inv.stock<0){
                //revert change
                await Inventory.updateOne({pid,vid},{$inc:{stock:-delta}});
                return res.status(400).json({message:'Operation would make stock negative'});
            }
            return res.json(inv);
        }
    }catch(err){
        console.error('vendor update stock error:', err);
        res.status(500).json({error: err.message});
    }
});

//----------------------------------------------------
// 3] ROUTE CUSTOMER PURCHASE:- SAFE STOCK REDUCTION (STANDALONE,MONGODB)
// POST /API/INVENTORY/PURCHASE.
// BODY;- {ITEMS:[{PID,VID,QTY}],CUSTOMERID:OPTIONAL},
// USER:-ATOMIC FINDONEANDUPDATE WITH STOCK >= QTY CONDITON PER ITEM 

  router.post('/purchase', async(req,res) => {
    console.log('purchase request body:',req.body);

    try{
        const items = req.body.items;

        if(!Array.isArray(items) || items.length ===0)
        {
            return res.status(400).json({message:'items required'})
        }

        //  VALIDATE INPUT

        for(const it of items)
        {
            if(!it.pid || !it.vid || !it.qty)
            {
                return res.status(400).json({message:'each item must include pid.vid and qty'});
            }
            if(!Number.isFinite(Number(it.qty)) || Number(it.qty) <= 0)

                {
                    return res.status(400).json({message:'qty must be a positive number'});
                }
        }

        //  WE'ALL KEEP TRACK OF SUCCESSFULL UPDATES TO ATTEMPTS ROLLBACK ON FAILURE

        const updatedItems = [];

        for(const it of items)
        {
            const pid = toNum(it.pid);
            const vid = toNum(it.vid);
            const qty = toNum(it.qty);

            // ATOMIC CHECK AND DECREMENT ON A SINGLE DOCUMENTS

            const inv = await Inventory.findOneAndUpdate(
                {pid,vid, stock : {$gte:qty}},
                {
                    $inc: {stock:-qty,soldCount:qty},
                    $set:{updatedAt:new Date()},
                },
                {new:true}
            );

            if(!inv)
            {
          // NOT ENOUGH OR INVENTORY MISSING -> ATTEMTS ROLLBACK FOR PRIOR UPDATE ITEMS 
          
           if(updatedItems.length > 0)
           {
            try
            {
                // BEST EFFORT ROLLBACK: ADD BACK QTY FOR PREVIOSALY UPDATES ITEMS

                const rollbackPromises = updatedItems.map(ui =>
                    Inventory.updateOne({pid : ui.pid, vid:ui.vid},{$inc :{stock: ui.qty * 1 * 1,soldCount: -ui.qty}})
                );

                await Promise.all(rollbackPromises);
                console.warn('Rolled back Previous inventrory updates due to failure on anotoer items.');
            }
            catch(rbErr)
            {
                console.error('Rollback failed or partial rollback:',rbErr);

                // CONTINUE - WE'LL STILL RETURN ERROR BELOW
            }
           }

           return res.status(400).json({
            error:`Insufficient stock or inventory not found for pid ${pid}, vid${vid}`,
           });
            }

            updatedItems.push({pid,vid,qty});
        }

        // OPTIONAL : IF YOU HAVE AN ORDER MODEL,CREATE ORDER HERE USING UPDATEDITEMS AND REQ.BODY.CUSTOMERID
        // EXAMPLE.
        // CONST ORDER = REQUIRE('...MODELS/ORDER');
        // AWAIT ORDER.CREATE({
        // CUSTOMERID:REQ.BODY.CUSTOMERID || NULL,
        // ITEMS: UPDATEDITEMS,
        // CREATEDAT : NEW DATE(),
        //})

        console.log('Purchase succesfully for items:',updatedItems);
        return res.json({
            success:true,
            message:'Purchase Completed',
            items: updatedItems,
        });
    }
    catch(err)
    {
         console.error('Purchse error:',err);
         return res.status(500).json({error:err.message});
    }
  });

  // ---------------------------------------
  // 4] SIMPLE GETTERS / MANAGMENT ENDPOINTS
  // ---------------------------------------

  router.get('/getstock/:pid/:vid',async(req,res) => {
    try                                               
    {
         const pid = toNum(req.params.pid);
         const vid = toNum(req.params.vid);

         const inv = await Inventory.findOne({pid,vid});
         if(!inv) return res.status(404).json({message:'Inventory not found'});

         return res.json({stock:inv.stock, reserved:inv.reserved, soldCount:inv.soldCount});
    }
    catch(err)
    {
        console.error('get stock error:',err);
        return res.status(500).json({error:err.message});
    }
  });

    router.get('/inventorybyvendor/:vid',async (req,res) => {
        try{
             const vid = toNum(req.params.vid);

             const invRecords = await Inventory.find({vid});
             return res.json(invRecords);
        }
        catch(err)
        {
            console.error('get inventory bt vender errors:',err);
            return res.status(500).json({error:err.message});
        }
    });

    router.get('/inventorybyproduct/:pid',async(req,res) => {
        try
        {
            const pid = toNum(req.params.pid);

          const invRecords = await Inventory.find({pid});
             return res.json(invRecords);
        }                                                  
        catch(err)
        {
            console.error('get inventory bt Product errors:',err);
            return res.status(500).json({error:err.message});
              }
    });

    router.get('/allinventory',async(req,res) => {
        try
        {
          const invRecords = await Inventory.find();
             return res.json(invRecords);
        }
        catch(err)
        {
            console.error('get all inventory errors:',err);
            return res.status(500).json({error:err.message});
              }
    });

     router.get('/stock',async(req,res) => {
        try
        {
          const invRecords = await Inventory.find();
             return res.json(invRecords);
        }
        catch(err)
        {
            console.error('get all inventory errors:',err);
            return res.status(500).json({error:err.message});
              }                      

    });

    router.delete('/deletestock/:pid/vendor/:vid',async (req,res) => {
        try 
        {
            const pid = toNum(req.params.pid);
            const vid = toNum(req.params.vid);

            const result = await Inventory.deleteOne({pid, vid});

            if(result.deletedCount === 0)
            {
                return res.status(404).json({message:'Inventory not found'});
            }
            return res.json({message:'Inventory delete succesfully'});
        }
        catch(err)
        {
            console.error('delete inventory error:',err);
            return res.status(500).json({error:err.message});
        }
    });

      
     //*************************************************** */
     // NEW := CONVENIENCE ENDPOINTS (NON-DESTRUCTION HELPER)
     //-POST := CREATE INVENTORY > CREATE INVENTORY FOR AN EXISTING PRODUCTS (IDEMPOTENT)
     // POST := MANAGESTOCK > CONVENIENCE WRAPPER FOR SET/INC USING JSON BODY.
      // THESE ARE SMALL HELPERS AND DONT'T ALTER THE EXISTING ROUTES BEHAVIOUR
     //*************************************************** */

     //----------------------------
     // POST := /CREATEINVENTORY
     // BODY := {PID, VID, INTIALSTOCK?,THRESHOLD?,UPDAREDBY?}


       router.post('/createinventory',async (req,res) => {
        console.log("createinventory",req.body);

        try
        {
            const {pid: rawPid,vid: rawVid,initialStock = 0, threshold, updatedBy} = req.body;
            const pid = toNum(rawPid);
            const vid = toNum(rawVid);

            if(!pid || !vid) return res.status(400).json({message:'pid and vid are required'});

            //  ENSURE PRODUCTS EXISTS

            const product = await Product.findOne({pid});
            if(!product) return res.status(404).json({message:`Product pid ${pid} not found`});

            //  IF INVENTORY ALREADY EXISTS OPTIONALLY BUMP STOCK OR JUST RETURN

            const existing = await Inventory.findOne({pid,vid});

            if(existing)
            {
                if(Number.isFinite(Number(initialStock)) && Number(initialStock) > 0)
                {
                    existing.stock = existing.stock + toNum(initialStock);
                    if(threshold !== undefined) existing.threshold = threshold;
                    if(updatedBy) existing.updatedBy = updatedBy;
                     existing.updatedAt = new Date();
                     await existing.save();
                }
            return res.json({message:'Inventory already existes',Inventory:existing});
            
             }

             //  CREATE NEW INVENTORY

             const inv = new Inventory({                       
                pid,
                vid,
                stock:toNum(initialStock) || 0,
                reserved:0,
                soldCount:0,
                threshold:threshold ?? 5,
                updatedBy:updatedBy || null,
             })             


             await inv.save();
             return res.status(201).json({message:'Inventory created', inventory:inv});
        }
        catch(err)
        {
            console.error('createinventory error:',err);
            return res.status(500).json({error:err.message});
        }
       });

       /*
        POST := MANAGESTOCK
        BODY := {PID,VID,MODE:'SET|INC, STOCK?,DELTA?}
       */

        router.post('/managestock', async(req,res) => {
            try
            {
                const {pid:rawPid,vid:rawVid , mode = 'inc'} = req.body;
                const pid = toNum(rawPid);
                const vid = toNum(rawVid);

                if(!pid || !vid) return res.status(400).json({message:'pid and vid are required'});

                // ====  AUTH CHECH (IMPLEMETS IN TOUR APP) ====

                const user = req.user || {};

                if(!user) return res.status(401).json({message:'unathorized'});

                if(user.role === 'vendor' && Number(user.vid)!== vid)
                {
                    return res.status(403).json({message:'Forbidden-cannot modify another vender inventory'})
                }

                if((mode || '').toLowerCase() === 'set')
                {
                    const stockVal = Number(req.body.stock);
                    if(!Number.isFinite(stockVal) || stockVal <0) return res.status(400).json({message:'stock must be >= 0'});

                    const inv = await Inventory.findOneAndUpdate(
                        {pid,vid},{$set: {stock: stockVal,updatedAt:new Date(), updatedBy:user.username || user.id || null}},{new: true}
                    );

                    if(!inv) return res.status(404).json({message:'Inventory not found'});
                    return res.json(inv);
                }
                else
                {
                    const delta = Number(req.body.delta);
                    if(!Number.isFinite(delta)) return res.status(400).json({message:'delta (number) required'});

                    const inv = await Inventory.findOneAndUpdate(
                        {pid,vid },
                    
                    {$inc: {stock:delta},$set:{updatedAt: new Date(), updatedBy: user.username || user.id || null}},
                {new : true}
            );

            if(!inv) return res.status(404).json({message:'Inventory not found'});

            if(inv.stock <0)
            {
                await Inventory.updateOne({pid,vid},{$inc:{stock: -delta }});
                return res.status(400).json({message:'Operation would make stock negative'});
            }

            return res.json(inv);
                }
            } catch(err)
            {
                console.error('managestock error',err);
                return res.status(500).json({error:err.message});
            }
        });


            //=========== SOFT DELETE (DEACTIVE) ===========

            router.patch('/deletestock/:pid/vendor/:vid', async(req,res) => {
                const pid = toNum(req.params.pid);
                const vid = toNum(req.params.vid);
                console.log(`Soft deleting inventory for pid ${pid}, vid ${vid}`)
                const inv = await Inventory.findOneAndUpdate(
                    {pid,vid},
                    {$set: {status:"Inactive",stock:0,updatedAt:new Date()}},
                    {new: true}
                );

                if(!inv) return res.status(404).json({message:"Inventory not found"});
                console.log("Soft deleted Inventory:", inv);
                res.json({inventory:inv});
            })



            
            //=========== RESTORE INVENTORY ===========

            router.patch('/restorestock/:pid/vendor/:vid', async(req,res) => {
                const pid = toNum(req.params.pid);
                const vid = toNum(req.params.vid);
                const inv = await Inventory.findOneAndUpdate(
                    {pid,vid},
                    {$set: {status:"active",updatedAt:new Date()}},
                    {new: true}
                );

                if(!inv) return res.status(404).json({message:"Inventory not found"});
                res.json({inventory:inv});
            });



          module.exports = router;
        module.exports.createInventoryForNewProduct = createInventoryForNewProduct;














// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');

// const Inventory = require('./Inventory.model.js');
// const product = require('../product/product.model.js');

// //  HELPER TO COERCE NUMBERS

// const toNum = v => (typeof v === 'number' ? v : Number(v));

// // 1] HELPER : CREATE INVENTORY WHEN VENDER ADDS PRODUCTS
// // USE THIS FUNCTION FORM YOUR PRODUCT CREATION CONTROLLER AFTER PRODUCT IS SAVED .
// // E.G. CONST INV = AWAIT CREATEINVENTRORY FOR  NEW PRODUCT.PID.. NEWPRODUCT.VID.INITIALSTOCKES.

// // async function createInventoryForNewProduct(pid. vid. initialStock =0. opts = {})
// async function createInventoryForNewProduct(pid, vid, initialStock =0, opts = {})
// {
//     try{
//         if(!pid || !vid) throw new Error('pid and vid requreid');

//         //  ENSURE PRODUCTS EXISTS

//         const product = await Product.findOne({pid:to})
//     }
// }