const express = require("express");
const venderRoute = express.Router();
const Vender = require("./vender.model");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cloudinary = require("../cloudinary");

let lastVenderImage = "";

// memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* SAVE VENDER IMAGE */
venderRoute.post(
  "/savevenderimage",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "Image upload failed" });

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "venders" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      lastVenderImage = result.secure_url;

      res.json({
        message: "Image uploaded successfully",
        imageUrl: result.secure_url,
      });
    } catch (err) {
      res.status(500).json({ message: "Cloud upload failed" });
    }
  }
);

/* REGISTER */
venderRoute.post("/register", async (req, res) => {
  try {
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

    const maxVidDoc = await Vender.findOne().sort({
      Vid: -1,
    });
    const newVid = maxVidDoc ? maxVidDoc.Vid + 1 : 1;

    const vender = new Vender({
      ...req.body,
      Vid: newVid,
      VPicName: lastVenderImage,
    });

    await vender.save();

    lastVenderImage = "";

    res.send("REGISTRATION SUCCESSFULLY");
  } catch (err) {
    console.error(err);
    res.status(400).send("Registration Failed");
  }
});

module.exports = venderRoute;
