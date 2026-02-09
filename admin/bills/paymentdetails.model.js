
  let mongoose = require ('mongoose');
const Razorpay = require('razorpay');
  const Schema = mongoose.Schema;

  let PaymentDetails = new Schema ({
       orderCreationId : {type : String},
       rozorpayPayment : {type : String},
       RazorpayOrderId:{type:String},
       rozorpaySignature : {type : String},
       cid:{type:Number},
       billid:{type: Number},
       amount : {type : Number}
  },
{
    collection : "PaymentDetails"
});
 module.exports = mongoose.model('PaymentDetails',PaymentDetails);