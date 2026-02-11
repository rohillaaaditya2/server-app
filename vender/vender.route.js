const express = require("express");
const venderRoute = express.Router();
const Vender = require("./vender.model");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cloudinary = require("../cloudinary");

// MULTER MEMORY STORAGE
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* EMAIL FUNCTION */
function sendGMail(mailto) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bsmernwala@gmail.com",
      pass: "necc umnw wnpi bmzy",
    },
  });

  const mailOptions = {
    from: "bsmernwala@gmail.com",
    to: mailto,
    subject: "Registration successful",
    text:
      "Dear Vendor, your registration is successful. Admin approval required before login.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Email Error:", error);
    else console.log("Email sent:", info.response);
  });
}

/* VENDOR REGISTRATION (IMAGE + DATA TOGETHER) */
venderRoute.post(
  "/register",
  upload.single("file"),
  async (req, res) => {
    try {
      let imageUrl = "";

      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "vendors" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        imageUrl = result.secure_url;
      }

      const exists = await Vender.findOne({
        $or: [
          { VUserId: req.body.VUserId },
          { VEmail: req.body.VEmail },
        ],
      });

      if (exists)
        return res
          .status(400)
          .send("VUserId or Email already exists");

      const maxVidDoc = await Vender.findOne().sort({ Vid: -1 });
      const newVid = maxVidDoc ? maxVidDoc.Vid + 1 : 1;

      const vender = new Vender({
        ...req.body,
        Vid: newVid,
        VPicName: imageUrl,
      });

      await vender.save();

      sendGMail(req.body.VEmail);

      res.json({ message: "REGISTRATION SUCCESSFUL" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Registration failed" });
    }
  }
);

/* LOGIN */
venderRoute.post("/getone", async (req, res) => {
  const { vuid, vupass } = req.body;

  try {
    const vender = await Vender.findOne({
      VUserId: vuid,
      VUserPass: vupass,
    });

    if (!vender)
      return res.status(404).send("INVALID CREDENTIALS");

    res.send(vender);
  } catch (err) {
    res.status(500).send("SOMETHING WENT WRONG");
  }
});

/* GET ALL VENDORS */
venderRoute.get("/getvendercount", async (req, res) => {
  try {
    const venders = await Vender.find();
    res.send(venders);
  } catch (err) {
    res.status(500).send("SOMETHING WENT WRONG");
  }
});

/* UPDATE VENDOR PROFILE */
venderRoute.put(
  "/update/:VUserId",
  upload.single("file"),
  async (req, res) => {
    try {
      const VUserId = req.params.VUserId;
      const vender = await Vender.findOne({ VUserId });

      if (!vender)
        return res.status(404).send("VENDOR NOT FOUND");

      let imageUrl = vender.VPicName;

      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "vendors" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        imageUrl = result.secure_url;
      }

      const updateData = {
        VenderName: req.body.VenderName || vender.VenderName,
        VAddress: req.body.VAddress || vender.VAddress,
        VContact: req.body.VContact || vender.VContact,
        VEmail: req.body.VEmail || vender.VEmail,
        VPicName: imageUrl,
      };

      await Vender.updateOne({ VUserId }, { $set: updateData });

      res.send({
        message: "PROFILE UPDATED SUCCESSFULLY",
        updateData,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("ERROR UPDATING PROFILE");
    }
  }
);

module.exports = venderRoute;
