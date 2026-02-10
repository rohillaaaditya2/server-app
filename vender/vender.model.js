//   const mongoose = require('mongoose');
//   const Schema = mongoose.Schema;

//       const VenderSchema = new Schema({
//       VUserId:{type:String, unique:true, required:true},
//       VUserPass:{type:String, required:true},
//       VenderName:{type:String,required:true},
//       VAddress:{type:String},
//       VContact:{type:Number},
//       VEmail:{type:String, unique:true, required:true},
//       VPicName:{type:String,default:""},
//       Vid:{type:Number,unique:true,required:true},
//       Status:{type:String,default:"Inactive"}

//   },
// {
//       collection:"Vender"});
//       module.exports = mongoose.model("Vender",VenderSchema);
const mongoose = require("mongoose");

const venderSchema = new mongoose.Schema({
  Vid: Number,
  VUserId: { type: String, unique: true },
  VUserPass: String,
  VenderName: String,
  VAddress: String,
  VContact: String,
  VEmail: { type: String, unique: true },

  // Cloudinary image URL
  VPicUrl: String,

  Status: {
    type: String,
    default: "Inactive",
  },
});

module.exports = mongoose.model("Vender", venderSchema);
