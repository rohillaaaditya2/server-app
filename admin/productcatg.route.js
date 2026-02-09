
const express = require('express');
const productcatgRoute = express.Router();
let ProductCatg = require('./productcatg.model');

// SAVE PRODUCT CATERORY

productcatgRoute.route('/addproductcatg/:pcatgid/:pcatgname').post(function (req,res) {
    let productcatg = new ProductCatg({"pcatgid":req.params.pcatgid,"pcatgname":req.params.pcatgname});
    // let productcatg = new ProductCatg({pcatgid:req.params.pcatgid,pcatgname:req.params.pcatgname});

    productcatg.save().then(productcatg => {
        res.send("PRODUCT CATEGORY ADDED SUCCESFULLY");
        res.end();
    }).catch(err =>{
        res.send(err);
        res.end();
    });
});


  // SHOW ALL PRODUCT CATEGORY

    productcatgRoute.route('/showproductcatg').get(function (req,res)
{
    ProductCatg.find().then(productcatg => {
        res.send(productcatg);
        res.end();
    }).catch(err =>{
        res.send("DATA NOT FOUND SOMETHING WENT WRONG");
        res.end();
    });
});

 // UPDATE PRODUCT CATG
   productcatgRoute.route('/updateproductcatg/:pcatgid/:pcatgname').put(function (req,res) {
    ProductCatg.updateOne({"pcatgid":req.params.pcatgid},{"pcatgname":req.params.pcatgname}).then(productcatg =>{
        res.send("PRODUCT CATEGERY ADDED SUCCESSFULY");
        res.end();
    }).catch(err =>{
        res.send(err);
        res.end();
    });
   });

   module.exports = productcatgRoute;

