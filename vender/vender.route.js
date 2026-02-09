
  const express = require('express');
  const venderRoute = express.Router();
  const Vender = require("./vender.model");
//   const Vender = require("./vender.model.js");
  const path = require("path");
  const multer = require("multer");
  const nodemailer = require("nodemailer");
const folderpath=path.join(__dirname,"venderphoto")

   // MULTER STORAGE FOR PROFILE IMAGES

   const storage = multer.diskStorage({destination:(req,file,cb)=> cb(null,folderpath),filename:(req,file,cb)=> cb(null,Date.now()+ path.extname(file.originalname))});
   const upload = multer({storage});
   venderRoute.post('/savevenderimage',upload.single('file'),(req,res)=>{
       res.json({});
}) 
    
                        

      // VENDER REGISTERATION

      venderRoute.post("/register",async (req,res)=>{
        console.log("register function called");
        try{
            console.log("regi fun"+req.body.VUserId+" "+req.body.VEmail);
            const exists = await Vender.findOne({$or:[{VUserId:req.body.VUserId},{VEmail:req.body.VEmail}]});
            console.log("exist="+exists)
            if(exists) return res.status(400).send("VUserId Email already exixts");

            const maxVidDoc = await Vender.findOne().sort({Vid: -1});
            const newVid = maxVidDoc ? maxVidDoc.Vid + 1 : 1;
            const vender = new Vender({...req.body, Vid:newVid});
            console.log("regi fun")
            await vender.save();
            res.send("REGISTERATION SUCCESSFULLY");
        } catch(err) {
            console.log(err)
            console.error(err);
            res.status(400).send("Registration Failed");
        }
      });

            //   SEND EMAIL FUNCTION ON SUCCESSFULL REGISTERATION

              function sendGMail(mailto)
              {  
            const transporter = nodemailer.createTransport({
                service:"gmail",
                auth:{user : "bsmernwala@gmail.com",pass:"necc umnw wnpi bmzy"},
            });

            const mailOption = {
                from : "bsmernwala@gmail.com",
                to:mailto,
                subject:"REGISTERATION SUCCESFULLY",
                text:"Dear Vender, you registration is succesfull.admin review is required before you can login",

            };

            transporter.sendMail(mailOption,(error,info) =>{
                if(error) console.error("EMAIL ERROR",error);
                else console.log("EMAIL SENT:",info.response);
            })
              }

           // LOGIN

             venderRoute.post("/getone",async(req,res)=>{
                // const vuid= req.body.vuid;
                // const vupass=req.body.vupass;

                const {vuid,vupass} = req.body;

                try
                {
                    const vender = await Vender.findOne({VUserId:vuid, VUserPass:vupass});
                    if(!vender) return res.status(404).send("INVALID CREDENTIALS");
                    console.log("vender data="+vender)
                    res.send(vender);
                }catch(err)
                {
                    res.status(500).send("SOMETHING WENT WRONG");
                }
             });

                // GET ALL VENDORS
                venderRoute.get("/getvendercount", async(req,res)=>{
                    try{
                        const venders = await Vender.find();
                        res.send(venders);
                    }catch(err)
                    {
                        res.status(500).send("SOMETHING WENT WRONG");
                    }
                });

                  // TOGGLE VENDER STATUS

                  venderRoute.put("/vendermanage/:vid/:status",async(req,res)=>{
                    try{
                        await Vender.updateOne({Vid:req.params.vid}, {Status:req.params.status});
                        res.send("VENDER STATUS UPDATED SUCCESFULLY");
                    }
                    catch(err)
                    {
                        res.status(500).send(err);
                    }
                  });


                       // SEND MAIL GMAIL FUNCTION ON VENDER ACTIVATED BY ADMIN

                       function sendGMailbyVenderActivaton(mailto)
                       {
                        const transporter = nodemailer.createTransport({
                              service : "gmail",
                              auth:{user : "bsmernwala@gmail.com", pass:"necc umnw wnpi bmzy"},
                        })
                        const mailOptions = {
                            from : "bsmernwala@gmail.com",
                            to:mailto,
                            subject: "REGISTRATION SUCCESS",
                            text:"DEAR VENDER,you are activated by admin new you can login",
                        };

                        transporter.sendMail(mailOptions,(error,info) =>{
                            if(error) console.error("Email Error=",error);
                            else console.log("Email Sent:",info.response)
                        })
                       }

                   // UPDATE VENDER PROFILE

                //    venderRoute.put("/update/:VUserid".upload.single("file"),async(req,res)=>{
                   venderRoute.put("/update/:VUserId",upload.single("file"),async(req,res)=>{
                    try{
                        const VUserId = req.params.VUserId;
                        const vender = await Vender.findOne({VUserId});
                        if(!vender) return res.status(404).send("VENDER NOT FOUND");

                        const updateData = {
                            VenderName:req.body.VenderName || vender.VenderName,
                            VAddress: req.body.VAddress || vender.VAddress,
                            VContact : req.body.VContact || vender.VContact,
                            VEmail:req.body.VEmail || vender.VEmail,
                            VPicName:req.file ? req.file.filename: vender.VPicName
                        };
                        await Vender.updateOne({VUserId}, {$set:updateData});
                        res.send({message : "PROFILE UPDATED SUCCESSFULLY",updateData});
                    }catch(err)
                    {
                        // res.status(500).send("ERROR UPDATING PROFILE");
                        
                         console.error("UPDATE ERROR:", err);
                   res.status(500).send(err.message);


                    }
                   });


                        // FORGET PASSWORD (OPT)

                        let otpStore = {};  //temorary storage
                        
                          // SEND OTP 
                          venderRoute.post("/send-otp", async (req,res) => {
                             try{
                                const {VUserId} = req.body;
                                const vender = await Vender.findOne({VUserId});

                                if(!vender)
                                {
                                    return res.status(404).json({success : false, message: "VENDER NOT FOUND"});
                                }
                                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                                otpStore[VUserId] = otp;

                                // CONFIGURE MAIL

                                let transporter = nodemailer.createTransport({
                                    service: "gmail",
                              auth:{user : "bsmernwala@gmail.com", pass:"necc umnw wnpi bmzy"} // USE APP PASSWORD
                                });

                                await transporter.sendMail({
                                    from : "bsmernwala@gmail.com",
                                    to:vender.VEmail,
                                    subject:"vender password reset OTP",
                                    text:`Your OTP is ${otp}`
                                });

                                res.json({success : true,message: "OTP sent to registered email"});
                             }
                               catch(err)
                               {
                                console.error(err);
                                res.status(500).json({success : false, message:"Error Sending OTP"});
                               }
                          });

                             //  RESET PASSWORD

                             venderRoute.post("/reset-password", async (req,res) =>{
                                try{
                                    const {VUserId, otp, newPassword} = req.body;

                                    if(!otpStore[VUserId] || otpStore[VUserId] !=otp)
                                    {
                                        return res.status(400).json({success : false,message:"Invalid OTP"});
                                    }

                                    await Vender.updateOne({VUserId} , {$set: {VUserPass : newPassword}});
                                   delete otpStore[VUserId];

                                   res.json({success: true,message: "Password Reset Successful"})
                                } catch(err)
                                {
                                     console.error(err);
                                     res.status(500).json({success: false,message :"ERROR reseting password"});
                                }
                             });


                             // CHANGE PASSWORD

                             venderRoute.post("/changepassword", async (req,res) => {
                                try{
                        const {VUserId,OldPassword, newPassword} = req.body;

                          //   VALIDATE INPUT

                          if(!VUserId || !OldPassword || !newPassword)
                            return res.status(400).json({message: "All Filed are required"});

                          //  FIND THE CUSTUMER

                          const vender = await Vender.findOne({VUserId});
                          if(!vender)
                            return res.status(404).json({message: "vender not found"});

                          // VERIFY OLD PASSWORD

                          if(vender.VUserPass !=OldPassword)
                            return res.status(400).json({message: "old password is incorrect"});

                          // UPDATE NEW PASSWORD

                          vender.VUserPass = newPassword;
                          await vender.save();

                          res.json({message: "PASSWORD CHANGED SUCCESFULLY"});
                                }
                                catch(err)
                                {
                                    console.error("Error Changing Password:",err);
                                    res.status(500).json({message:"Server error"});
                                }
                             });



                    // GET VENDER IMAGE
                    venderRoute.get("/getimage/:vpicname",(req,res)=>{
                        res.sendFile(__dirname+"/venderphoto/"+req.params.vpicname);
                    });
                    module.exports = venderRoute;