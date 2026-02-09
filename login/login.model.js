 
//    const mongoose = require('mongoose');
// const { collection } = require('../vender/vender.model');
//    const Schema = mongoose.Schema;

//    const LoginForm = new Login({
          
//           Name:{type:String},
//           Pass:{type:Number},
//           Age:{type:Number},
//           Email:{type:String}
//         },
//       {
//         collection:'login',
//       })
//         module.exports =mongoose.model('login',LoginForm);





var mongoose=require('mongoose');
const Schema=mongoose.Schema;
var User=new Schema({
    uid:{type:String},
    upass:{type:String},
    fullname:{type:String},
    email:{type:String},
    
},
{
    collection:'Profile'
}
);
module.exports=mongoose.model('Profile',Profile);




