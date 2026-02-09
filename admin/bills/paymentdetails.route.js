
  const express = require('express');
  const paymentdetailsRoute = express.Router();
  let PaymentDetails = require('./paymentdetails.model');

  // SAVE PAYMENT DETAILS

  paymentdetailsRoute.route('/paymentdetailsave').post((req,res) => {
    let paymentdetails = new PaymentDetails(req.body);

    console.log("Bill Id"+req.body.billid+"Customer id" + req.body.cid);

    paymentdetails.save().then(bill => {
        res.send("Payment details saved succesfully");
        res.end();
    }).catch(err => {
        res.send(err);
        res.end();
    });
  });

  // GET PAYMENT DETAILS

  paymentdetailsRoute.route('/showpaymentdetails').get((req,res) => {
    PaymentDetails.find().then(pd => {
         res.send(pd);
         res.end();
    }).catch(err => {
        res.send(err);
        res.end();
    });
  });

  // GET PAYMENT DETAILS BY BILL ID

  paymentdetailsRoute.route('/showpaymentdetailsbybid/:billid').get((req,res) => {
    PaymentDetails.findOne({"billid": req.params.billid}).then(pd => {
        res.send(pd);
        res.end();
    }).catch(err => {
        res.send(err);
        res.end();
    });
  });

  module.exports = paymentdetailsRoute;