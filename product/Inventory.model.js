// MODEL INVENTARY.JS

  const mongoose = require('mongoose');
  const Schema = mongoose.Schema;

  const InventorySchema = new Schema({
      pid : {type:Number,required:true,index:true},  // REFERENCES PRODUCT.PID
      vid : {type:Number,required:true,index:true},  // VENDER ID (SAME AS PRODUCT.VID)
      stock :{type: Number,default:0},                  // AVAILABLE STOCK
      reserved:{type:Number,default:0},              // REVERSEED FOR CART / CHECHED
      soldCount:{type:Number,default:0},              // CUMULATE SOLD VIA THIS INVENTORY RECORD
      threshold:{type:Number,default:5},                     // LOW-STOCK THRESHOLD FOR ALERTS
      createdAt:{type:Date,default:Date.now},
      updatedAt:{type:Date,default:Date.now},
      updatedBy:{type:String},                          // USER WHO MADE THE LAST UPDATE
  },{
    timestamps:true,
    collection:'Inventory'
  });

  module.exports = mongoose.model('Inventory',InventorySchema);