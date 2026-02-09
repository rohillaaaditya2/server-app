  // npm install razorpay;
  // npm install dotenv;

  // CREATE A PAYMENT.JS FILE IN THE SERVER-APP FOLDER AND ADD THE FOLLOWING  CODE

  require("dotenv").config();
  const express = require("express");
  const Rozorpay = require("razorpay");

  const router = express.Router();

  router.post("/orders/:amt", async (req,res) => {
    try
    {
        const instance = new Rozorpay({
            key_id: process.env.ROZORPAY_KEY_ID,
            key_secret:process.env.ROZORPAY_SECRET,

        })

        const options = {
            amount : req.params.amt,
            currency : "INR",
            receipt : "receipt_order_74394",
            
        };

        const order = await instance.orders.create(options);
        if(!order) return res.status(500).send("Some error  occured");

        res.json(order);
    }
     catch(error)
     {
        res.status(500).send(error);
     }
  });

  // SUCCESS PAGE
  
    router.post("/success",async (req,res) => {
        // TRANSACTION DETAILS

        res.send("Payment Successfully Done");

        res.end();
    });
    module.exports = router;

    // npm install rozorpay --save
    // npm install dotenv --save