
   const express = require('express');
   const cityRoute = express.Router();
   let City = require("./city.model");

   //   SAVE CITY

   cityRoute.route("/save").post ((req,res)=>{
      let city = new City(req.body);
      city.save().then(city => {
        res.send("CITY SAVED");
        res.end();
      }).catch(err => {
        res.send(err);
        res.end();
      });
   });
    

     // SEARCH CITY

     
   cityRoute.route("/search/:ctid").get ((req,res)=>{
       City.findOne({"ctid":req.params.ctid}).then( city => {
        res.send(city);
        res.end();
      }).catch(err => {
        res.send(err);
        res.end();
      });
   });

   // UPDATE CITY

     cityRoute.route
('/update').
put((req, res)=>{
    City.updateOne({"ctid":req.body.ctid},{"ctid": req.body.ctid,"ctname":req.body.City.ctname,"stid":req.body.stid,"status":req.body.status}).then(city=>{
        res.send('city updated successfully');
        res.end();
    })
    .catch((err)=>{
        res.send(err);
        res.end();
    });
});


    
   // SHOW ALL CITY

   cityRoute.route('/show').get((req,res)=> {
    City.find({"status":1}).then( city => {
        res.send(city);
        res.end();
      }).catch(err => {
        res.send(err);
        res.end();
   })
   })

   //  SHOW ALL CITIES BY STATE

    cityRoute.route('/showcitybystate/:stid').get((req,res)=> {
        City.find({$and:[{"status":1},{"stid":req.params.stid}]}).then( city => {
        res.send(city);
        res.end();
      }).catch(err => {
        res.send(err);
        res.end();
   })
    })

      // SHOW ALL
            
      cityRoute.route('/getall').get(function (req,res){
        City.find().then( city => {
        res.send(city);
        res.end();
      }).catch(err => {
        res.send(err);
        res.end();
   })
      });
            
        // SAERCH STATE BT NAME TO AVOID DUPLICATE ENTRY    

        cityRoute.route("/searchbyname/:ctname").get((req,res)=>{
            City.findOne({"ctname":req.params.ctname}).then( city => {
        res.send(city);
        res.end();
      }).catch(err => {
        res.send(err);
        res.end();
   })
        })
        module.exports = cityRoute;