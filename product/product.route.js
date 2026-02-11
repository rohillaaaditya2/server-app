const express = require("express");
const productRoute = express.Router();
const Product = require("./product.model");
const multer = require("multer");
const cloudinary = require("../cloudinary");
const { createInventoryForNewProduct } = require("./Inventory.route.js");

let lastProductImage = "";

// memory storage for cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* SAVE PRODUCT IMAGE (CLOUDINARY) */
productRoute.post(
  "/saveproductimage",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "Image upload failed" });

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

      lastProductImage = result.secure_url;

      res.json({
        message: "Image uploaded successfully",
        imageUrl: result.secure_url,
      });
    } catch (err) {
      res.status(500).json({ message: "Cloud upload failed" });
    }
  }
);

/* SAVE PRODUCT */
productRoute.post("/saveproduct", async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      ppicname: lastProductImage,
    });

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

    lastProductImage = "";

    res.send("Product Added Successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

/* SHOW PRODUCTS BY VENDER */
productRoute.get("/showproductbyvender/:vid", (req, res) => {
  Product.find({ vid: req.params.vid })
    .then((data) => res.send(data))
    .catch((err) => res.status(400).send(err));
});

/* GET ALL PRODUCT */
productRoute.get("/showproduct", (req, res) => {
  Product.find()
    .then((products) => res.send(products))
    .catch(() => res.status(400).send("DATA NOT FOUND"));
});

/* GET MAX PID */
productRoute.get("/getmaxpid", (req, res) => {
  Product.find()
    .then((products) => res.send(products))
    .catch(() => res.status(400).send("ERROR"));
});

/* UPDATE STATUS */
productRoute.put("/updateproductstatus/:pid/:status", (req, res) => {
  Product.updateOne(
    { pid: req.params.pid },
    { status: req.params.status }
  )
    .then(() =>
      res.send("PRODUCT STATUS UPDATED SUCCESSFULLY")
    )
    .catch((err) => res.status(400).send(err));
});

/* UPDATE PRODUCT */
productRoute.put("/updateproduct/:pid", (req, res) => {
  Product.updateOne(
    { pid: req.params.pid },
    { $set: req.body }
  )
    .then(() => res.send("PRODUCT UPDATED SUCCESSFULLY"))
    .catch((err) => res.status(400).send(err));
});

module.exports = productRoute;
