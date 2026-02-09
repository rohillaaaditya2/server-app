   const express = require("express");
     const app = express();
     const customerRoute = express.Router();
     const Customer = require("./customer.model");
     const fs = require("fs");
    const multer = require("multer");
     const nodemailer = require('nodemailer');
     const path = require("path");

     


      //  ENSURE IMAGE FOLDER EXISTS

   const imageDir = path.join(__dirname, "rahulimage/");

     


       const storage = multer.diskStorage({destination:(req,file,cb)=> cb(null,imageDir),filename:(req,file,cb)=> cb(null,Date.now()+ path.extname(file.originalname))});
         const upload = multer({storage});
        
      // ......  GMAIL FUNCTION ..... //

        function sendGMail(mailto)
        {
             const transporter = nodemailer.createTransport({
                service : "gmail",
                auth:{user:"bsmernwala@gmail.com", pass:"necc umnw wnpi bmzy"},
             });

             const mailOptions = {
                from:"bsmernwala@gmail.com",
                to:mailto,
                subject:"Registration success",
                text:"Dear Customer, your registration is succesful. admin review is required before you can login",
             };

             transporter.sendMail(mailOptions,(error,info) => {
                if(error) console.error("Email Error:", error);
                else console.log("Email sent:",info.response);
             });
        }

           // ...... CUSTOMER REGISTATION .......//

           customerRoute.post("/register", async(req,res)=>{
             try{
                const {CUserId,CEmail} = req.body;

                // SAVE CUSTOMER

                const customer = new Customer(req.body);
                await customer.save();

                sendGMail(CEmail);
                res.json({Message: "REGISTRATION SUCCESFUL"});
             }
             catch(err)
             {
                console.error(err);

                // HANDLE DUPLICATE KEY ERROR
                if(err.code === 11000)
                {
                    if(err.keyPattern.CEmail) return res.status(400).json({Message : "Email already exists"});
                    if(err.keyPattern.CUserId) return res.status(400).json({Message : "USer ID already exists"});
                }

                res.status(500).json({Message:"Server error"});
             };
           });

            // .....  LOGIN .....//        

            customerRoute.post("/login", async(req,res)=>{
                const {CUserId, CUserPass} = req.body;

                try
                {
                    const customer = await Customer.findOne({CUserId,CUserPass});
                    if(! customer) return res.status(404).json({Message:"Invalid credentials"});
                    res.json(customer);
                }catch(err)
                {
                     console.error(err);
                     res.status(500).json({Message:"Server error"});
                };
            });


               customerRoute.post("/savecustomerimage", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Image upload failed" });
    res.json({ message: "Image uploaded successfully", imageUrl: req.file.filename });
});

               //..... GET CUSTOMER IMAGE .....//
               customerRoute.get("/getimage/:cpicname",(req, res) =>{
                res.sendFile(imageDir + req.params.cpicname);          
               });

               //...... GET CUSTOMER COUNT .....//

               customerRoute.get("/getcustomercount", async(req,res) =>{
                 try{
                    const customers = await Customer.find();
                    res.json(customers);
                    if(!customers) return res.status(403).json({message:"no customer available"});
                 } catch(err)
                 {
                    res.status(500).json({Message:"Server error"});
                 }
               });

               // ....  GET CUSTOMER DETAILS BY ID ......//

               customerRoute.get("/getcustomerdetails/:cid", async(req,res)=>{
                 try{
                  console.log('cid',req.params.cid)
                    const customer = await Customer.findOne({Cid: req.params.cid});
                    if(!customer) return res.status(404).json({Message:"Customer not found"});
                      res.json(customer);
                 } catch(err)
                 {
                    res.status(500).json({message:"Server error"});
                 }
               });

//                // GET CUSTOMER DETAILS BY CID
// customerRoute.get("/getcustomerdetails/:cid", async (req, res) => {
//     try {
//         const customer = await Customer.findOne({ cid: req.params.cid });

//         if (!customer) {
//             return res.status(404).send({ msg: "Customer not found" });
//         }

//         res.send({
//             CustomerName: customer.CustomerName,
//             CAddress: customer.CAddress,
//             CContact: customer.CContact,
//             CEmail: customer.CEmail
//         });
//     } catch (err) {
//         res.status(500).send(err);
//     }
// });


               // ...... GET CUSTOMER LIST .....//

               customerRoute.get("/getcustomerlist", async(req,res) =>{
                     try{
                        const customers = await Customer.find();
                        res.json(customers);
                     }catch(err)
                     {
                        res.status(500).json({message:"Server error"});
                     };
               });

               //......  ENABLE/DISABLE CUSTOMER ......//
               customerRoute.put("/customermanage/:cid/:status", async (req,res)=>{
                  try
                  {
                    await Customer.updateOne({Cid:req.params.cid}, {Status:req.params.status});
                    sendGMailbyAdminCustomerActivation(req.params.status === "Active" ? (await Customer.findOne({Cid:req.params.cid})).CEmail : null);

                    res.json({message : "Customer status update succesfully"});
                  }catch(err)
                  {
                    res.status(500).json({message:"Server Error"});
                  }
               });

                  // SEND MAIL GMAIL FUNCTION ON CUSTOMER ACTIVATED BY ADMIN

                  function sendGMailbyAdminCustomerActivation(mailto){
                    const transporter = nodemailer.createTransport({
                        service:"gmail",
                        auth:{user : "bsmernwala@gmail.com",pass:"necc umnw wnpi bmzy"}
                    });

                    const mailOptions = {
                        from: "bsmernwala@gmail.com",
                        to:mailto,
                        subject:"Registration Success",
                        text:"Dear Customer, your are Activated by Admin now you can login",
                    };

                    transporter.sendMail(mailOptions,(error,info) =>{
                        if(error) console.error("Email error:",error);
                        else console.log("Email sent",info.response);
                    });
                  }

                  // ..... FORGET PASSWORD: SEND OTP .....//

                  customerRoute.post("/forgotpassword/send-otp", async (req,res) =>{
                     const {CUserId} = req.body;
                     try{
                        const customer = await Customer.findOne({CUserId});
                        if(!customer) return res.status(404).json({message: "Customer not found"});

                        const otp = Math.floor(100000 + Math.random() * 900000).toString();
                        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

                        customer.otp = otp;
                        customer.otpExpiry = otpExpiry;
                        await customer.save();
                        const transporter = nodemailer.createTransport({
                            service:"gmail",
                        auth:{user : "bsmernwala@gmail.com",pass:"necc umnw wnpi bmzy "},
                     });
                         transporter.sendMail({
                            from:"bsmernwala@gmail.com",
                            to:customer.CEmail,
                            subject:"OTP for password Reset",
                            text: `Dear ${customer.CustomerName}, your OTP is ${otp}. IT expires in 10 minutes.`,
                         }, (error,info) => {
                            if(error) return res.status(500).json({message:"Failed to send OTP"});
                            res.json({ message:"OTP sent to email"});
                         });
                     }

                     catch(err)
                     {
                        res.status(500).json({message:"Server error"});
                     }
                  });
                                      
                  //......  VERIFY OTP  &  RESET PASSWORD ......//

                  customerRoute.post("/forgotpassword/verify-otp", async(req,res)=>{
                     const {CUserId, OTP, newPassword} = req.body;

                     try{
                        const customer = await Customer.findOne({CUserId});
                        if(!customer) return res.status(404).json({message:"Customer not found"});

                        if(!customer.otp || !customer.otpExpiry)
                           return res.status(400).json({message:"No OTP found, Request again"});

                        if(customer.otp !== OTP) return res.status(400).json({message:"Invalid OTP"});
                        if(customer.otpExpiry < new Date()) return res.status (400).json({message:"OTP expried"});

                        customer.CUserPass = newPassword;
                        customer.otp = undefined;
                        customer.otpExpiry=undefined;
                        await customer.save();

                        res.json({message:"password reset succesfully"});
                     }catch(err)
                     {
                        res.status(500).json({message:"Server error"})
                     }
                  });

         customerRoute.put("/update/:cid",upload.single("CPicName"),async (req,res) => {
            try{
               const {cid} = req.params;
                
               console.log("Received Update request for CID:",cid);
               console.log("Body Date:",req.body);
               console.log("File date:",req.file ? req.file.filename : "no file uploaded");
               const {CEmail,CUserId} = req.body;
               const customer = await Customer.findOne({Cid:cid});
               if(!customer)
               {
                  console.log("Customer not found");
                  return res.status(404).json({message:"Customer not found"});
               }

                // CHEAK FOR DUPLICATE EMAIL

                const emailExists = await Customer.findOne({CEmail,Cid : {$ne : cid}});
                if(emailExists)
                {
                  console.log("Duplicate email found:",CEmail);
                  return res.status(400).json({message:"Email already exists"});
                }

                // CHEACK FOR DUPLICATE USER ID

                const userIdExists = await Customer.findOne({CUserId,Cid :{ $ne : cid} });
                if(userIdExists)
                {
                  console.log("Duplicate UserID found:",CUserId);
                  return res.status(400).json({message:"User ID already exists"});
                }

                // UPDATE DATA

                customer.CustomerName = req.body.CustomerName;
                customer.CAddress = req.body.CAddress;
                customer.CContact = req.body.CContact;
                customer.CEmail = CEmail;
                customer.CUserId = CUserId;
                customer.StId = req.body.StId;
                customer.CtId = req.body.CtId;

                if(req.file) customer.CPicName = req.file.filename;

                await customer.save();
                console.log("Customer updated succesfully:",customer.CustomerName);
                res.json({message:"Profile updated succesfully", customer});
            } catch(err)
            {
               console.error("Error in updated route:",err);
               res.status(500).json({message : "Server error"});
            };
         });

          // ..... CHANGE PASSWORD .....//

          customerRoute.post("/changepassword", async (req,res) =>{
              try{
               const {CUserId, OldPassword,NewPassword} = req.body;

               // VALIDATE INPUT

               if(! CUserId || !OldPassword || !NewPassword)
                  return res.status(400).json({message:"All fields are required"});

               //  FIND THE CUSTOMER

               const customer = await Customer.findOne({CUserId});
               if(!customer)
                  return res.status(404).json({message:"Customer not found"});

               // VERIFY OLD PASSWORD

               if(customer.CUserPass !==OldPassword)
                  return res.status(400).json({message:"Old Password is incorecct"});

               // UPDATE NEW PASSWORD

               customer.CUserPass =NewPassword;
               await customer.save();

               res.json({message:"Password changed successfully"});
                 }catch(err)
                 {
                  console.error("Error changing password:",err);
                  res.status(500).json({message:"Server Error"});
                 }

//                  // EMAIL SEND MESSAGE 

//                  customerRoute.post("/emailactivation/send", async (req,res)=>{
//   const {email, subject, message} = req.body;

//   try{
//     const transporter = nodemailer.createTransport({
//       service:"gmail",
//       auth:{
//         user:"bsmernwala@gmail.com",
//         pass:"necc umnw wnpi bmzy"
//       }
//     });

//     await transporter.sendMail({
//       from:"bsmernwala@gmail.com",
//       to: email,
//       subject: subject,
//       text: message
//     });

//     res.json({message:"Email sent successfully"});
//   }catch(err){
//     res.status(500).json({message:"Email sending failed"});
//   }
// });

          });

          module.exports = customerRoute;




















          
//      const express = require("express");
//      const app = express();
//      const customerRoute = express.Router();
//      const Customer = require("./customer.model");
//      const fs = require("fs");
//     const multer = require("multer");
//      const nodemailer = require('nodemailer');
//      const path = require("path");

     

// //      const fs = require('fs');
// // const { text } = require("body-parser");
// // const { measureMemory } = require("vm");
// // const { cursorTo } = require("readline");
// // const { useEffect } = require("react");
// // const customerModel = require("./customer.model");


//       //  ENSURE IMAGE FOLDER EXISTS

//       const imageDir = path.join(__dirname,"customerimages");
//       if(!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, {recursive : true});

//       // STATIC ROUTE FOR IMAGES

//       app.use("/customerimages" , express.static(imageDir));



//       // ........... MULTER STROAGE FOR LOCAL IMAGES

//       const storage = multer.diskStorage({destination:(req,file,cb) => cb(null,__dirname + "/customerimages/"),
//           filename:(req,file,cb) => cb(null, file.originalname),});

//       const upload = multer({storage});

//       // ......  GMAIL FUNCTION ..... //

//         function sendGMail(mailto)
//         {
//              const transporter = nodemailer.createTransport({
//                 service : "gmail",
//                 auth:{user:"bsmernwala@gmail.com", pass:"necc umnw wnpi bmzy"},
//              });

//              const mailOptions = {
//                 from:"bsmernwala@gmail.com",
//                 to:mailto,
//                 subject:"Registration success",
//                 text:"Dear Customer, your registration is succesful. admin review is required before you can login",
//              };

//              transporter.sendMail(mailOptions,(error,info) => {
//                 if(error) console.error("Email Error:", error);
//                 else console.log("Email sent:",info.response);
//              });
//         }

//            // ...... CUSTOMER REGISTATION .......//

//            customerRoute.post("/register", async(req,res)=>{
//              try{
//                 const {CUserId,CEmail} = req.body;

//                 // SAVE CUSTOMER

//                 const customer = new Customer(req.body);
//                 await customer.save();

//                 sendGMail(CEmail);
//                 res.json({Message: "REGISTRATION SUCCESFUL"});
//              }
//              catch(err)
//              {
//                 console.error(err);

//                 // HANDLE DUPLICATE KEY ERROR
//                 if(err.code === 11000)
//                 {
//                     if(err.keyPattern.CEmail) return res.status(400).json({Message : "Email already exists"});
//                     if(err.keyPattern.CUserId) return res.status(400).json({Message : "USer ID already exists"});
//                 }

//                 res.status(500).json({Message:"Server error"});
//              };
//            });

//             // .....  LOGIN .....//

//             customerRoute.post("/login", async(req,res)=>{
//                 const {CUserId, CUserPass} = req.body;

//                 try
//                 {
//                     const customer = await Customer.findOne({CUserId,CUserPass});
//                     if(! customer) return res.status(404).json({Message:"Invalid credentials"});
//                     res.json(customer);
//                 }catch(err)
//                 {
//                      console.error(err);
//                      res.status(500).json({Message:"Server error"});
//                 };
//             });

//                // // ..... UPLOAD CUSTOMER IMAGE ......//
//                // // customerRoute.post("/savecustomerimage",(req,res)=>{
//                // //    res.send("api is recieved");
//                // // })

//                // customerRoute.post("/savecustomerimage",(req,res)=>{
//                //    res.send("call is coming");
//                //    console.log("Hello");
//                //    console.log("req data",req.file);
//                // //  if(!req.file) return res.status(400).json({Message:"Image upload failed"});
//                // //  res.json({Message:"image uploaded succesfully", imageUrl:req.file.filename});
//                // });

//                customerRoute.post("/savecustomerimage", upload.single("file"), (req, res) => {
//     if (!req.file) return res.status(400).json({ message: "Image upload failed" });
//     res.json({ message: "Image uploaded successfully", imageUrl: req.file.filename });
// });

//                //..... GET CUSTOMER IMAGE .....//
//                customerRoute.get("/getimage/:cpicname",(req, res) =>{
//                 res.sendFile(__dirname + "/customerimages/" + req.params.cpicname);
//                });

//                //...... GET CUSTOMER COUNT .....//

//                customerRoute.get("/getcustomercount", async(req,res) =>{
//                  try{
//                     const customers = await Customer.find();
//                     res.json(customers);
//                     if(!customers) return res.status(403).json({message:"no customer available"});
//                  } catch(err)
//                  {
//                     res.status(500).json({Message:"Server error"});
//                  }
//                });

//                // ....  GET CUSTOMER DETAILS BY ID ......//

//                customerRoute.get("/getcustomerdetails/:cid", async(req,res)=>{
//                  try{
//                     const customer = await Customer.findOne({Cid: req.params.cid});
//                     if(!customer) return res.status(404).json({Message:"Customer not found"});
//                       res.json(customer);
//                  } catch(err)
//                  {
//                     res.status(500).json({message:"Server error"});
//                  }
//                });

//                // ...... GET CUSTOMER LIST .....//

//                customerRoute.get("/getcustomerlist", async(req,res) =>{
//                      try{
//                         const customers = await Customer.find();
//                         res.json(customers);
//                      }catch(err)
//                      {
//                         res.status(500).json({message:"Server error"});
//                      };
//                });

//                //......  ENABLE/DISABLE CUSTOMER ......//
//                customerRoute.put("/customermanage/:cid/:status", async (req,res)=>{
//                   try
//                   {
//                     await Customer.updateOne({Cid:req.params.cid}, {Status:req.params.status});
//                     sendGMailbyAdminCustomerActivation(req.params.status === "Active" ? (await Customer.findOne({Cid:req.params.cid})).CEmail : null);

//                     res.json({message : "Customer status update succesfully"});
//                   }catch(err)
//                   {
//                     res.status(500).json({message:"Server Error"});
//                   }
//                });

//                   // SEND MAIL GMAIL FUNCTION ON CUSTOMER ACTIVATED BY ADMIN

//                   function sendGMailbyAdminCustomerActivation(mailto){
//                     const transporter = nodemailer.createTransport({
//                         service:"gmail",
//                         auth:{user : "bsmernwala@gmail.com",pass:"necc umnw wnpi bmzy"}
//                     });

//                     const mailOptions = {
//                         from: "bsmernwala@gmail.com",
//                         to:mailto,
//                         subject:"Registration Success",
//                         text:"Dear Customer, your are Activated by Admin now you can login",
//                     };

//                     transporter.sendMail(mailOptions,(error,info) =>{
//                         if(error) console.error("Email error:",error);
//                         else console.log("Email sent",info.response);
//                     });
//                   }

//                   // ..... FORGET PASSWORD: SEND OTP .....//

//                   customerRoute.post("/forgotpassword/send-otp", async (req,res) =>{
//                      const {CUserId} = req.body;
//                      try{
//                         const customer = await Customer.findOne({CUserId});
//                         if(!customer) return res.status(404).json({message: "Customer not found"});

//                         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//                         const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

//                         customer.otp = otp;
//                         customer.otpExpiry = otpExpiry;
//                         await customer.save();
//                         const transporter = nodemailer.createTransport({
//                             service:"gmail",
//                         auth:{user : "bsmernwala@gmail.com",pass:"necc umnw wnpi bmzy "},
//                      });
//                          transporter.sendMail({
//                             from:"bsmernwala@gmail.com",
//                             to:customer.CEmail,
//                             subject:"OTP for password Reset",
//                             text: `Dear ${customer.CustomerName}, your OTP is ${otp}. IT expires in 10 minutes.`,
//                          }, (error,info) => {
//                             if(error) return res.status(500).json({message:"Failed to send OTP"});
//                             res.json({ message:"OTP sent to email"});
//                          });
//                      }

//                      catch(err)
//                      {
//                         res.status(500).json({message:"Server error"});
//                      }
//                   });
                                      
//                   //......  VERIFY OTP  &  RESET PASSWORD ......//

//                   customerRoute.post("/forgotpassword/verify-otp", async(req,res)=>{
//                      const {CUserId, OTP, newPassword} = req.body;

//                      try{
//                         const customer = await Customer.findOne({CUserId});
//                         if(!customer) return res.status(404).json({message:"Customer not found"});

//                         if(!customer.otp || !customer.otpExpiry)
//                            return res.status(400).json({message:"No OTP found, Request again"});

//                         if(customer.otp !== OTP) return res.status(400).json({message:"Invalid OTP"});
//                         if(customer.otpExpiry < new Date()) return res.status (400).json({message:"OTP expried"});

//                         customer.CUserPass = newPassword;
//                         customer.otp = undefined;
//                         customer.otpExpiry=undefined;
//                         await customer.save();

//                         res.json({message:"password reset succesfully"});
//                      }catch(err)
//                      {
//                         res.status(500).json({message:"Server error"})
//                      }
//                   });

//          customerRoute.put("/update/:cid",upload.single("CPicName"),async (req,res) => {
//             try{
//                const {cid} = req.params;
                
//                console.log("Received Update request for CID:",cid);
//                console.log("Body Date:",req.body);
//                console.log("File date:",req.file ? req.file.filename : "no file uploaded");
//                const {CEmail,CUserId} = req.body;
//                const customer = await Customer.findOne({Cid:cid});
//                if(!customer)
//                {
//                   console.log("Customer not found");
//                   return res.status(404).json({message:"Customer not found"});
//                }

//                 // CHEAK FOR DUPLICATE EMAIL

//                 const emailExists = await Customer.findOne({CEmail,Cid : {$ne : cid}});
//                 if(emailExists)
//                 {
//                   console.log("Duplicate email found:",CEmail);
//                   return res.status(400).json({message:"Email already exists"});
//                 }

//                 // CHEACK FOR DUPLICATE USER ID

//                 const userIdExists = await Customer.findOne({CUserId,Cid :{ $ne : cid} });
//                 if(userIdExists)
//                 {
//                   console.log("Duplicate UserID found:",CUserId);
//                   return res.status(400).json({message:"User ID already exists"});
//                 }

//                 // UPDATE DATA

//                 customer.CustomerName = req.body.CustomerName;
//                 customer.CAddress = req.body.CAddress;
//                 customer.CContact = req.body.CContact;
//                 customer.CEmail = CEmail;
//                 customer.CUserId = CUserId;
//                 customer.StId = req.body.StId;
//                 customer.CtId = req.body.CtId;

//                 if(req.file) customer.CPicName = req.file.filename;

//                 await customer.save();
//                 console.log("Customer updated succesfully:",customer.CustomerName);
//                 res.json({message:"Profile updated succesfully", customer});
//             } catch(err)
//             {
//                console.error("Error in updated route:",err);
//                res.status(500).json({message : "Server error"});
//             };
//          });

//           // ..... CHANGE PASSWORD .....//

//           customerRoute.post("/changepassword", async (req,res) =>{
//               try{
//                const {CUserId, OldPassword,NewPassword} = req.body;

//                // VALIDATE INPUT

//                if(! CUserId || !OldPassword || !NewPassword)
//                   return res.status(400).json({message:"All fields are required"});

//                //  FIND THE CUSTOMER

//                const customer = await Customer.findOne({CUserId});
//                if(!customer)
//                   return res.status(404).json({message:"Customer not found"});

//                // VERIFY OLD PASSWORD

//                if(!customer.CUserPass !==OldPassword)
//                   return res.status(400).json({message:"Old Password is incorecct"});

//                // UPDATE NEW PASSWORD

//                customer.CUserPass =NewPassword;
//                await customer.save();

//                res.json({message:"Password changed successfully"});
//                  }catch(err)
//                  {
//                   console.error("Error changing password:",err);
//                   res.status(500).json({message:"Server Error"});
//                  }
//           });

//           module.exports = customerRoute;











