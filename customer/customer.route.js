const express = require("express");
const customerRoute = express.Router();
const Customer = require("./customer.model");
const multer = require("multer");
const cloudinary = require("../cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* REGISTER */
customerRoute.post("/register", upload.single("file"), async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
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

      imageUrl = result.secure_url;
    }

    const customer = new Customer({
      ...req.body,
      CPicUrl: imageUrl,
    });

    await customer.save();
    res.send("Registration Successful");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* LOGIN */
customerRoute.post("/login", async (req, res) => {
  const customer = await Customer.findOne(req.body);
  if (!customer) return res.status(404).send("Invalid credentials");
  res.send(customer);
});

/* GET DETAILS */
customerRoute.get("/getcustomerdetails/:cid", async (req, res) => {
  const customer = await Customer.findOne({ Cid: req.params.cid });
  res.send(customer);
});

/* UPDATE PROFILE */
customerRoute.put("/update/:cid", upload.single("file"), async (req, res) => {
  try {
    const customer = await Customer.findOne({ Cid: req.params.cid });
    if (!customer) return res.status(404).send("Customer not found");

    Object.assign(customer, req.body);

    if (req.file) {
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

      customer.CPicUrl = result.secure_url;
    }

    await customer.save();
    res.send({ message: "Profile updated", customer });
  } catch (err) {
    res.status(500).send("Update failed");
  }
});

module.exports = customerRoute;
