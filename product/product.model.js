
  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;

  const ProductSchema = new Schema({
       pid:{type:Number,required:true,unique:true},
       pname:{type:String,required:true},
        pprice:{type:Number,required:true},
        oprice:{type:Number,required:true},
        ppicname:{type:String},
        pcatgid:{type:Number},
        vid:{type:Number},
        status:{type:String,default:"Active"},

  },
  {
          collection: 'Product'
     } )

         module.exports=mongoose.model("Product",ProductSchema);