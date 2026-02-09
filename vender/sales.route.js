  
  const express = require("express");
  const router = express.Router();
  const Sale = require("./sales.model");
  const Product = require("../product/product.model");

  // ADD SALES

     router.post("/add", async(req,res) => {
        try
        {
            const sale = new Sale(req.body);
            console.log("sale call"+sale)
            await sale.save();
            res.json(sale);
        }
         catch(err)
         {
            res.status(500).json({error: err.message});
         }
     });

     // GET SALES BY VENDER (JOIN PRODUCT INFO)
     router.get("/vender/:venderId", async (req,res) => {
        try{
            // const sales = (await Sale.find({venderId:req.params.venderId})).sort({date : -1});
            const sales = await Sale.find({venderId:req.params.venderId}).sort({date : -1});
              const productIds = sales.map( s => Number(s.productId))
            const products = await Product.find({pid : {$in:productIds}});

            const salesWithProducts = sales.map(sale => {
                const product = products.find( p => p.pid === sale.productId);

                return{
                    ...sale._doc,
                    product : product ? {
                        pname : product.pname,
                        oprice : product.oprice,
                        pprice : product.pprice,
                        ppicname : product.ppicname
                    }:null
                };
            });
            res.json({sales : salesWithProducts});
        } catch(err)
        {
            res.status(500).json({error: err.message});
        }
     });

     module.exports = router;