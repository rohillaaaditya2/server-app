
//      const express = require("express");
//      const productRoute = express.Router();
//      const Product = require("./product.model");
//      const multer = require('multer');
//      const path = require('path');
//      const fs = require('fs');
//      const mongoose = require('mongoose');
//    const {createInventoryForNewProduct} = require('./Inventory.route.js');


//      // STORAGE SETUP

//           const storage = multer.diskStorage({
//             destination:(req,file,cb) =>{
//                  const dir = path.join(__dirname,"productimages");

//                  if(!fs.existsSync(dir)) fs.mkdirSync(dir);
//                  cb(null,dir);
//             },
//               filename:(req,file,cb)=> cb(null,file.originalname),
//           });

//           const upload = multer({storage});


//           // SAVE PRODUCT

//          //  productRoute.post("/saveproduct",async(req,res)=> {
//          //      try{
//          //        const product = new Product(req.body);
//          //        await product.save();
//          //        res.send('Product added successfully');
//          //      }
//          //         catch(err) 
//          //         {
//          //            res.status(400).send(err.message);
//          //         }
//          //  })


//          productRoute.post('/saveproduct', async (req, res) => {
//    try {
//       //  Product create
//       const product = new Product(req.body);
//       console.log("product g--", product);

//       // Save product
//       await product.save();

//       //  Create inventory for new product
//       await createInventoryForNewProduct(
//          product.pid,
//          product.vid,
//          req.body.initialStock || 0,
//          {
//             updatedBy: product.vid,   // vendor id
//             createdAt: new Date(),
//             updatedAt: new Date()
//          }
//       );

//       //  Success response
//       res.send('Product Added Successfully');

//    } catch (err) {
//       res.status(400).send(err.message);
//    }
// });

 

//              // UPLOAD IMAGE

//              productRoute.post("/saveproductimage",upload.single("file"),(req,res)=>{
//                 res.send("UPLOAD SUCCESS");
//              });

//              // GET IMAGE

//              productRoute.get("/getproductimage/:picname",(req,res)=>{
//                 const  imgPath = path.join(__dirname,"productimages",req.params.picname);

//                 if(fs.existsSync(imgPath)) res.sendFile(imgPath);

//                 else res.sendFile(path.join(__dirname,"productimages","default.png"));
//              });

//                // SHOW PRODUCTS BY VENDER

//                productRoute.get("/showproductbyvender/:vid",(req,res)=>{
//                 Product.find({vid:req.params.vid}).then((data) => res.send(data)).catch((err) =>  res.status(400).send(err));
//                });

//                // SAVE PRODUCT

//                productRoute.route('/saveproduct').post((req,res)=>{
//                   const product = new Product(req.body);
//                   product.save()
//                   .then(()=> res.send("PRODUCT ADDED SECCESFULLY")).catch(err => res.send(400).send(err));
//                });

//                  // SHOW PRODUCT BY CATEGORY
//                  // GET PRODUCT BY CATEGORY

//                  productRoute.route("/showproductbycatgid/:pcatgid").get(function (req,res) {
//                      Product.find({"pcatgid":req.params.pcatgid}).then(product => {
//                         console.log(product);
//                         res.send(product);
//                         res.end();
//                      }).catch(err =>{
//                          res.send(err);
//                      });
//                  });

//                    //  GET ALL PRODUCT

//                    productRoute.route("/showproduct").get((req,res)=>{
//                       Product.find().then(products => res.send(products)).catch(err => res.status(400).send("DATA NOT FOUND"));
//                    });

//                      // GET PRODUCT BY VENDER

//                      productRoute.route("/showproductvender/:vid").get((req,res) => {
//                         Product.find({vid: req.params.vid}).then(products => res.send(products)).catch(err => res.status(400).send("DATA NOT FOUND"));
//                      });

//                      // GET PRODUCT COUNT / MAX PID

//                      productRoute.route("/getmaxpid").get((req,res)=>{
//                         Product.find().then(products => res.send(products))
//                         .catch(err => res.status(400).send("SOMETHING WANT WRONG"));
//                      });


//                        // GET PRODUCT IMAGE

//                     productRoute.route('/getproductimage/:picname').get((req,res)=>{
//                         res.sendFile(__dirname + "/productimages" + req.params.picname);
//                     });


//                       //  SOFT DELETE / UPDATE STATUS

//                       productRoute.route("/updateproductstatus/:pid/:status").put((req,res)=>{
//                         Product.updateOne({pid: req.params.pid},{status:req.params.status}).then(() => res.send("PRODUCT STATUS UPDATED SUCCESFULLY")).catch(err => res.status(400).send(err));
//                       });

//                       //  UPDATE PRODUCT DETAILS:=

//                       productRoute.route('/updateproduct/:pid').put((req,res)=>{
//                         Product.updateOne({pid:req.params.pid}, {$set : req.body}).then(()=> res.send("PRODUCT UPDATED SUCCCESFULLY")).catch(err => res.status(400).send(err));
//                       });


//                         // GET PRODUCT ALL

//                         productRoute.route("/showproductstatus/:pid").get(function (req,res){
//                              Product.find({"pid":req.params.pid}).then(product => {
//                                 console.log(product);
//                                 res.send(product);
//                                 res.end();
//                              }).catch(() => {
//                                 res.status(400).send("DATA NOT FOUND SOMETHING WENT WRONG");
//                              });
//                         })

//                         // GET PRODUCT BY PID
// productRoute.get("/showproduct/:pid", async (req, res) => {
//     try {
//         const product = await Product.findOne({ pid: req.params.pid });
//         if (!product) {
//             return res.status(404).send("Product not found");
//         }
//         res.send(product);
//     } catch (err) {
//         res.status(400).send(err.message);
//     }
// });

                       
//                         module.exports = productRoute;
const express = require("express");
     const productRoute = express.Router();
     const Product = require("./product.model");
     const multer = require('multer');
     const path = require('path');
     const fs = require('fs');
     const mongoose = require('mongoose');
   const {createInventoryForNewProduct} = require('./Inventory.route.js');


     // STORAGE SETUP

          const storage = multer.diskStorage({
            destination:(req,file,cb) =>{
                 const dir = path.join(__dirname,"productimages");

                 if(!fs.existsSync(dir)) fs.mkdirSync(dir);
                 cb(null,dir);
            },
              filename:(req,file,cb)=> cb(null,file.originalname),
          });

          const upload = multer({storage});


          // SAVE PRODUCT

         //  productRoute.post("/saveproduct",async(req,res)=> {
         //      try{
         //        const product = new Product(req.body);
         //        await product.save();
         //        res.send('Product added successfully');
         //      }
         //         catch(err) 
         //         {
         //            res.status(400).send(err.message);
         //         }
         //  })


         productRoute.post('/saveproduct', async (req, res) => {
   try {
      //  Product create
      const product = new Product(req.body);
      console.log("product g--", product);

      // Save product
      await product.save();

      //  Create inventory for new product
      await createInventoryForNewProduct(
         product.pid,
         product.vid,
         req.body.initialStock || 0,
         {
            updatedBy: product.vid,   // vendor id
            createdAt: new Date(),
            updatedAt: new Date()
         }
      );

      //  Success response
      res.send('Product Added Successfully');

   } catch (err) {
      res.status(400).send(err.message);
   }
});

 

             // UPLOAD IMAGE

             productRoute.post("/saveproductimage",upload.single("file"),(req,res)=>{
                res.send("UPLOAD SUCCESS");
             });

             // GET IMAGE

             productRoute.get("/getproductimage/:picname",(req,res)=>{
                const  imgPath = path.join(__dirname,"productimages",req.params.picname);

                if(fs.existsSync(imgPath)) res.sendFile(imgPath);

                else res.sendFile(path.join(__dirname,"productimages","default.png"));
             });

               // SHOW PRODUCTS BY VENDER

               productRoute.get("/showproductbyvender/:vid",(req,res)=>{
                Product.find({vid:req.params.vid}).then((data) => res.send(data)).catch((err) =>  res.status(400).send(err));
               });

               // SAVE PRODUCT

               productRoute.route('/saveproduct').post((req,res)=>{
                  const product = new Product(req.body);
                  product.save()
                  .then(()=> res.send("PRODUCT ADDED SECCESFULLY")).catch(err => res.send(400).send(err));
               });

                 // SHOW PRODUCT BY CATEGORY
                 // GET PRODUCT BY CATEGORY

                 productRoute.route("/showproductbycatgid/:pcatgid").get(function (req,res) {
                     Product.find({"pcatgid":req.params.pcatgid}).then(product => {
                        console.log(product);
                        res.send(product);
                        res.end();
                     }).catch(err =>{
                         res.send(err);
                     });
                 });

                   //  GET ALL PRODUCT

                   productRoute.route("/showproduct").get((req,res)=>{
                      Product.find().then(products => res.send(products)).catch(err => res.status(400).send("DATA NOT FOUND"));
                   });

                     // GET PRODUCT BY VENDER

                     productRoute.route("/showproductvender/:vid").get((req,res) => {
                        Product.find({vid: req.params.vid}).then(products => res.send(products)).catch(err => res.status(400).send("DATA NOT FOUND"));
                     });

                     // GET PRODUCT COUNT / MAX PID

                     productRoute.route("/getmaxpid").get((req,res)=>{
                        Product.find().then(products => res.send(products))
                        .catch(err => res.status(400).send("SOMETHING WANT WRONG"));
                     });


                       // GET PRODUCT IMAGE

                    productRoute.route('/getproductimage/:picname').get((req,res)=>{
                        res.sendFile(__dirname + "/productimages" + req.params.picname);
                    });


                      //  SOFT DELETE / UPDATE STATUS

                      productRoute.route("/updateproductstatus/:pid/:status").put((req,res)=>{
                        Product.updateOne({pid: req.params.pid},{status:req.params.status}).then(() => res.send("PRODUCT STATUS UPDATED SUCCESFULLY")).catch(err => res.status(400).send(err));
                      });

                      //  UPDATE PRODUCT DETAILS:=

                      productRoute.route('/updateproduct/:pid').put((req,res)=>{
                        Product.updateOne({pid:req.params.pid}, {$set : req.body}).then(()=> res.send("PRODUCT UPDATED SUCCCESFULLY")).catch(err => res.status(400).send(err));
                      });


                        // GET PRODUCT ALL

                        // productRoute.route("/showproductstatus/:pid").get(function (req,res){
                        //      Product.find({"pid":req.params.pid}).then(product => {
                        //         console.log(product);
                        //         res.send(product);
                        //         res.end();
                        //      }).catch(() => {
                        //         res.status(400).send("DATA NOT FOUND SOMETHING WENT WRONG");
                        //      });
                        // })

                        productRoute.get("/showproductstatus/:status", (req, res) => {
    Product.find({ status: req.params.status })
        .then(products => {
            res.send(products);
        })
        .catch(err => {
            res.status(400).send("DATA NOT FOUND");
        });
});


                        // GET PRODUCT BY PID
productRoute.get("/showproduct/:pid", async (req, res) => {
    try {
        const product = await Product.findOne({ pid: req.params.pid });
        if (!product) {
            return res.status(404).send("Product not found");
        }
        res.send(product);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

                       
                        module.exports = productRoute;