const nodemailer=require('nodemailer');
const express=require('express');
const emailRouter=express.Router();

emailRouter.post("/sendemail/:mailto/:subject/:message",async (req,res) => {
    try {
        res.status(200).json({response:"Mail Sent"});
        const mailto=req.params.mailto;
         const transporter=nodemailer.createTransport({
                    service:"gmail",
                    port:465,
                    secure:true,
                    auth:{user:"bsmernwala@gmail.com",pass:"necc umnw wnpi bmzy"},
                });
                const mailOption={
                    from:"bsmernwala@gmail.com",
                    to:mailto,
                    subject:req.params.subject,
                    text:req.params.message,
                };
                transporter.sendMail(mailOption,(error,info)=>{
                    if (error) {
                        console.error("Email error",error);
                    }else{
                        console.log("Email sent ",info.response);
                    }
                });
    } catch (error) {
       res.status(502).json({error}) 
    }
});
module.exports=emailRouter;