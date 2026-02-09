
    let mongoose = require('mongoose');
    const Schema=mongoose.Schema;
    let State = new Schema({
      stid:{type:Number},
      stname:{type:String},
      status:{type:Number}
    },
        {
          collection:'state'
        } 
  );
    module.exports = mongoose.model('state',State);