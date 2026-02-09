  
   let mongoose = require('mongoose');
   let Schema = mongoose.Schema;

   let Bill = new Schema(
    {
        billid :  {type: Number},
        billdate : {type : String},
        cid : {type : Number},
        pid : {type: Number},
        qty : {type : Number},

        status : {
             type : String,
             enum : ["Processing","Order Placed","Packed","Shiped","Out for Delivery","Delivared","Cancelled"],
             default : "Processing"
        },

        // NEW FILEDS
    },
    {
        collection : "Bill"
    }
   );

   module.exports = mongoose.model("Bill",Bill);