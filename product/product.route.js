const express = require("express");
const productRoute = express.Router();
const Product = require("./product.model");
const multer = require("multer");
const cloudinary = require("../cloudinary");
const { createInventoryForNewProduct } = require("./Inventory.route.js");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* SAVE PRODUCT */
productRoute.post("/saveproduct", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    await createInventoryForNewProduct(
      product.pid,
      product.vid,
      req.body.initialStock || 0,
      {
        updatedBy: product.vid,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    res.send("Product Added Successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

/* UPLOAD PRODUCT IMAGE */
productRoute.post(
  "/saveproductimage/:pid",
  upload.single("file"),
  async (req, res) => {
    try {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      await Product.updateOne(
        { pid: req.params.pid },
        { ppicurl: result.secure_url }
      );

      res.send({
        message: "UPLOAD SUCCESS",
        imageUrl: result.secure_url,
      });
    } catch (err) {
      res.status(500).send("Upload failed");
    }
  }
);

/* GET PRODUCTS */
productRoute.get("/showproduct", async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (err) {
    res.status(400).send("DATA NOT FOUND");
  }
});

/* GET PRODUCT BY PID */
productRoute.get("/showproduct/:pid", async (req, res) => {
  try {
    const product = await Product.findOne({ pid: req.params.pid });
    if (!product) return res.status(404).send("Product not found");
    res.send(product);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

/* PRODUCTS BY VENDOR */
productRoute.get("/showproductbyvender/:vid", async (req, res) => {
  try {
    const data = await Product.find({ vid: req.params.vid });
    res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
});

/* UPDATE PRODUCT */
productRoute.put("/updateproduct/:pid", async (req, res) => {
  try {
    await Product.updateOne({ pid: req.params.pid }, { $set: req.body });
    res.send("PRODUCT UPDATED");
  } catch (err) {
    res.status(400).send(err);
  }
});

/* UPDATE PRODUCT STATUS */
productRoute.put("/updateproductstatus/:pid/:status", async (req, res) => {
  try {
    await Product.updateOne(
      { pid: req.params.pid },
      { status: req.params.status }
    );
    res.send("PRODUCT STATUS UPDATED");
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = productRoute;
