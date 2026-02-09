
  let mongoose = require('mongoose');
  const Schema = mongoose.Schema;
  let ProductCatg = new Schema ({
     pcatgid:{type:Number},
     pcatgname:{type:String}
  },

{
     collection:'productcatg'
}
);

module.exports = mongoose.model('productCatg',ProductCatg);