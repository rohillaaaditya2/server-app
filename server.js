const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const config = require("./DB.js");

const productRoute = require("./product/product.route.js");
const venderRoute = require("./vender/vender.route.js");
const customerRoute = require("./customer/customer.route.js");
const inventoryRoute = require("./product/Inventory.route.js");
const saleRoute = require("./vender/sales.route.js");

const PORT = process.env.PORT || 9876;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ROUTES */
app.use("/product", productRoute);
app.use("/vender", venderRoute);
app.use("/customer", customerRoute);
app.use("/inventory", inventoryRoute);
app.use("/sales", saleRoute);

/* DATABASE */
mongoose
  .connect(config.URL, { useNewUrlParser: true })
  .then(() => console.log("DATABASE CONNECTED"))
  .catch((err) => console.log("DB ERROR:", err));

app.listen(PORT, () => {
  console.log("SERVER RUNNING ON PORT " + PORT);
});
