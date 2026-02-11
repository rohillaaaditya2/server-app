const express = require("express");
const customerRoute = express.Router();
const Customer = require("./customer.model");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cloudinary = require("../cloudinary");

let lastUploadedImage = "";

// MULTER MEMORY STORAGE (for cloud upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* GMAIL FUNCTION */
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
    subject: "Registration success",
    text:
      "Dear Customer, your registration is successful. Admin review is required before you can login",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Email Error:", error);
    else console.log("Email sent:", info.response);
  });
}

/* CUSTOMER REGISTRATION */
customerRoute.post("/register", async (req, res) => {
  try {
    const { CUserId, CEmail } = req.body;

    const customer = new Customer({
      ...req.body,
      CPicName: lastUploadedImage,
    });

    await customer.save();

    // reset image after registration
    lastUploadedImage = "";

    sendGMail(CEmail);
    res.json({ Message: "REGISTRATION SUCCESSFUL" });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      if (err.keyPattern.CEmail)
        return res.status(400).json({ Message: "Email already exists" });
      if (err.keyPattern.CUserId)
        return res.status(400).json({ Message: "User ID already exists" });
    }

    res.status(500).json({ Message: "Server error" });
  }
});

/* LOGIN */
customerRoute.post("/login", async (req, res) => {
  const { CUserId, CUserPass } = req.body;

  try {
    const customer = await Customer.findOne({ CUserId, CUserPass });
    if (!customer)
      return res.status(404).json({ Message: "Invalid credentials" });
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ Message: "Server error" });
  }
});

/* SAVE CUSTOMER IMAGE (CLOUDINARY) */
customerRoute.post(
  "/savecustomerimage",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "Image upload failed" });

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "customers" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      // store image URL temporarily
      lastUploadedImage = result.secure_url;

      res.json({
        message: "Image uploaded successfully",
        imageUrl: result.secure_url,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Cloud upload failed" });
    }
  }
);

/* GET CUSTOMER DETAILS */
customerRoute.get("/getcustomerdetails/:cid", async (req, res) => {
  try {
    const customer = await Customer.findOne({
      Cid: req.params.cid,
    });
    if (!customer)
      return res
        .status(404)
        .json({ Message: "Customer not found" });

    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* GET CUSTOMER LIST */
customerRoute.get("/getcustomerlist", async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ENABLE/DISABLE CUSTOMER */
customerRoute.put(
  "/customermanage/:cid/:status",
  async (req, res) => {
    try {
      await Customer.updateOne(
        { Cid: req.params.cid },
        { Status: req.params.status }
      );

      res.json({
        message: "Customer status updated successfully",
      });
    } catch (err) {
      res.status(500).json({ message: "Server Error" });
    }
  }
);

/* CHANGE PASSWORD */
customerRoute.post("/changepassword", async (req, res) => {
  try {
    const { CUserId, OldPassword, NewPassword } = req.body;

    if (!CUserId || !OldPassword || !NewPassword)
      return res
        .status(400)
        .json({ message: "All fields are required" });

    const customer = await Customer.findOne({ CUserId });
    if (!customer)
      return res
        .status(404)
        .json({ message: "Customer not found" });

    if (customer.CUserPass !== OldPassword)
      return res
        .status(400)
        .json({ message: "Old Password incorrect" });

    customer.CUserPass = NewPassword;
    await customer.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = customerRoute;
