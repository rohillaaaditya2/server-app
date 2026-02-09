
 const express = require('express');
 const billRoute = express.Router();
  let Bill = require('./bill.model');

  const Customer = require("../../customer/customer.model");
  const nodemailer = require("nodemailer");

  // SAVE BILL

//    billRoute.route('/billsave').post((req,res) => {
//      let bill = new Bill(req.body);

//      bill.save().then(bill => {
//         res.send({'bill' : 'bill added succesfully'});
//      }).catch(err => {
//         res.send(err);
//      });
//    });

billRoute.post("/billsave", async (req, res) => {
  try {
    // 1️⃣ last billid nikaalo
    const lastBill = await Bill.findOne().sort({ billid: -1 });

    // 2️⃣ next billid generate karo
    const nextBillId = lastBill ? lastBill.billid + 1 : 1001;

    // 3️⃣ new bill object banao (explicit fields)
    const bill = new Bill({
      billid: nextBillId,
      billdate: req.body.billdate,
      cid: req.body.cid,
      pid: req.body.pid,
      qty: req.body.qty,
      status: "Processing"
    });

    // 4️⃣ save
    await bill.save();

    res.send({
      message: "Bill added successfully",
      billid: nextBillId
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});


   // SHOW ALL BILL BY CUSTOEMR ID

   billRoute.route('/billshow/:cid').get((req,res) => {
     Bill.find({"cid" : req.params.cid}).then(bill =>{
        res.send(bill);
        res.end();
     }).catch(err => {
         res.send(err);
         res.end();
     }) ;
   });

   billRoute.route('/billshowbillids/:cid').get((req,res) => {
    Bill.find({cid:req.params.cid}).sort({billid : -1}).select("billid billdate -_id").then(bills => {
    // Bill.find({cid:req.params.cid}).sort({billid : -1}).select(*billid billdate - _id*).then(Bills => {
        

        //   REMOVE DUPLICATE MANUALLY

        const uniqueBills =[];
        const seen = new Set();

        for(const b of bills)
        {
            if(!seen.has(b.billid))
            {
                seen.add(b.billid);
                uniqueBills.push(b);
            }
        }

        res.send(uniqueBills);
    }).catch(err => {
        res.status(500).send(err);
    });
   });

   billRoute.route('/billshowbilldates/:cid').get((req,res) => {
       Bill.find({cid: req.params.cid}).sort({billid : -1}).select("billid billdate -_id").then(bills => {
        // REMOVE DUPLICATE MANUALLY

        const uniqueBills = [];
        const seen = new Set();

        for(const b of bills)
        {
              if(!seen.has(b.billdate))
              {
                seen.add(b.billdate);
                uniqueBills.push(b);
              }
        }
        res.send(uniqueBills);
       }).catch(err => {
        res.status(500).send(err);
       });
   });

   // GET ID OF LAST ENTERED BILL TO GENRATED ID FOR NEXT BILL

    billRoute.route('/getbillid').get((req,res) => {
        Bill.find().sort({"billid": -1}).limit(1).then(bill => {console.log(bill);
            res.send(bill);
            res.end();
        }).catch(err => {
            res.send(err);
            res.end();
        });
    });

    // GET BILL DETAILS BY BILLID

    billRoute.route('/showbillbyid/:billid').get((req,res) => {
        Bill.find({"billid":req.params.billid}).then(bill => {
            res.send(bill);
            res.end();
        }).catch(err => {
            res.send(err);
            res.end();
        });
    });

    // GET BILL DETAILS BY BILL DATE
 billRoute.route('/showbillbydate/:billdate').get((req,res) => {
    Bill.find({"billdate":req.params.billdate}).then(bill => {
        res.send(bill);
        res.end();
    }).catch(err => {
        res.send(err);
        res.end();
    });
 });

 //   SHOW ALL BILL

 billRoute.route('/billshow').get((req,res) => {
    Bill.find().then(bill => {
        res.send(bill);
        res.end();
    }).catch(err => {
        res.send(err);
        res.end();
    });
 });

 // TRACK ORDER BY BILL ID CUSTOMER

 billRoute.route('/trackorder/:billid').get((req,res) => {
    Bill.find({billid:req.params.billid}).then(bill => {
        if(bill.length === 0)
        {
            return res.status(404).send({message : "Order not found"});
        }
        res.send(bill[0]);  //  RETURN FIRST RECORD
    }).catch(err => {
        res.status(500).send(err);
    });
 });

 // UPDATE DATA 

   billRoute.put("/updatestatus", async (req,res) => {
     const {billid , status, updatedBy} = req.body;

     try
     {
        // UPDATE STATUS + UPDATEEDBY + UPDATED AT
        await Bill.updateMany(
            {billid:billid},
            {
                $set: {
                    status : status,
                    updatedBy : updatedBy || "Admin",
                    updatedAt : new Date()
                }
            }
        );

         // FETCH BILL TO FIND CUSTOMER ID

         const bill = await Bill.findOne({billid : billid});

         if(!bill) return res.status(404).send({msg : "Bill Not Found"});

         // FETCH CUSTOMER USING BILL.CID

         const customer = await Customer.findOne({Cid: bill.cid});
         if(!customer)
            return res.status(404).send({msg:"Customer not found for this bill"});

         const customerEmail = customer.CEmail;
         const customerName = customer.CustomerName;

         // EMAIL TRANSPORTER

         const transporter = nodemailer.createTransport({
            service : "gmail",
            auth : {
                user : process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,  // GMAIL APP PASSWORD
            }
         });

         // EMAIL CONTENT

         const mailOptions = {
            from : process.env.EMAIL_USER,
            to: customerEmail,
            subject : `Order Status Update - Bill #${billid}`,
            html :`
            <h2>Hello ${customerName},</h2>
            <p>Your Order <Strong>#${billid}</strong> has a new Update.</p>
            
            <p><strong>Status:</strong>${updatedBy || "Admin"}</p>

            <p><strong>Updated ON:</strong> ${new Date()}</p>

            <hr/>
            <p>you can track your order in your customer dashboard..</p>
            <p>Thanks you for shopping with us!</p>
            `
         };

         //  SEND EMAIL

         await transporter.sendMail(mailOptions);
         res.send({
            msg: "Status updated & email sent successfully", updatedBy: updatedBy || "Admin"
         });
     } catch(err)
     {
        console.log(err);
        res.status(500).send({msg: "Error updating Status", error:err});
     }
   });

   // GET ALL BILL IDS (ADMIN)

   billRoute.route('/allbillids').get((req,res) => {
    Bill.find().sort({billid : -1}).select("billid -_id").then(bills => {
        const ids = [... new Set(bills.map(b => b.billid))];  // UNIQUE BILLIDS
        res.send(ids);
    }).catch(err => res.status(500).send(err));
   });

   // GET CURRECT STATUS BY BILL ID

   billRoute.route("/getstatus/:billid").get((req,res) => {
    Bill.findOne({billid: req.params.billid}).select("billid status updatedBy updateAT -_id").then(result => {
        if(!result) return res.status(404).send({message : "Bill not found"});
        res.send(result);
    }).catch(err => res.status(500).send(err));
   });

   module.exports = billRoute;
