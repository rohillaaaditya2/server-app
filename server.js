      const express = require('express');
      const app = express();
      const bodyParser = require('body-parser');
      const cors = require('cors');
      const PORT = process.env.PORT || 9876;

      const mongoose = require('mongoose');
      const config = require('./DB.js');
      const stateRoute = require('./admin/state.route.js');
      const cityRoute = require('./admin/city.route.js');
      const productcatgRoute = require("./admin/productcatg.route.js");
      const productRoute = require("./product/product.route.js");
      const venderRoute=require("./vender/vender.route.js");
      const customerRoute=require('./customer/customer.route.js');
      const billRoute = require("./admin/bills/bill.route.js");
      const paymentdetailsRoute = require("./admin/bills/paymentdetails.route.js");
      const PaymentRoute = require("./payment.js");   
       const emailRoute = require("./emailmgt.js");
       const emailactivationRoute=require("./emailactivation.js");
       const inventoryRoute = require("./product/Inventory.route.js");
       const saleRoute = require("./vender/sales.route.js");
       const path = require("path");  

       app.use(cors());
       app.use(bodyParser.urlencoded({extended:true}));
       app.use(bodyParser.json());
       app.use('/state',stateRoute);
       app.use('/city',cityRoute);
       app.use('/productcatg',productcatgRoute);
       app.use("/product", productRoute);
       app.use('/customer',customerRoute);
       app.use("/payment",PaymentRoute);
       app.use('/vender',venderRoute);
       app.use('/bill',billRoute);
       app.use('/paymentdetails',paymentdetailsRoute);
       app.use("email",emailRoute);
       app.use("/emailactivation",emailactivationRoute);
       app.use("/sales",saleRoute);
       app.use("/inventory",inventoryRoute);
       app.use("/productimages",express.static(path.join(__dirname,"product/productimages")));

    mongoose.connect(config.URL, {
    useNewUrlParser: true})   .then(() => {
    console.log("DATABASE IS CONNECTED " + config.URL);
    },
   err => {
    console.log("CAN NOT CONNECT TO THE DATABASE " + err);
    });


app.listen(PORT,function (){
   console.log("SERVER IS RUNNING ON PORT="+PORT);
});

