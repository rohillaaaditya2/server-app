
  let mongoose = require('mongoose')
  const Schema = mongoose.Schema;
   let City = new Schema({
    ctid:{type:Number},
    ctname:{type:String},
    stid:{type:Number},
    status:{type:Number}
   },
{
    collection:'city'
});

 module.exports = mongoose.model("city",City);