const express = require("express");
const venderRoute = express.Router();
const Vender = require("./vender.model");
const multer = require("multer");
const cloudinary = require("../cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* REGISTER */
venderRoute.post("/register", upload.single("file"), async (req, res) => {
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

    const vender = new Vender({
      ...req.body,
      VPicUrl: imageUrl,
    });

    await vender.save();
    res.send("Vender Registered");
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

/* LOGIN */
venderRoute.post("/login", async (req, res) => {
  try {
    const vender = await Vender.findOne(req.body);
    if (!vender) return res.status(404).send("Invalid credentials");
    res.send(vender);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* GET ALL */
venderRoute.get("/getvendercount", async (req, res) => {
  const data = await Vender.find();
  res.send(data);
});

/* UPDATE PROFILE */
venderRoute.put("/update/:vid", upload.single("file"), async (req, res) => {
  try {
    const vender = await Vender.findOne({ Vid: req.params.vid });
    if (!vender) return res.status(404).send("Vendor not found");

    Object.assign(vender, req.body);

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

      vender.VPicUrl = result.secure_url;
    }

    await vender.save();
    res.send({ message: "Vendor updated", vender });
  } catch (err) {
    res.status(500).send("Update failed");
  }
});

module.exports = venderRoute;
