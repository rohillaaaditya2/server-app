// const express = require("express");
// const app = express();
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const path = require("path");

// const config = require("./DB.js");

// // ROUTES
// const stateRoute = require("./admin/state.route.js");
// const cityRoute = require("./admin/city.route.js");
// const productcatgRoute = require("./admin/productcatg.route.js");
// const billRoute = require("./admin/bills/bill.route.js");
// const paymentdetailsRoute = require("./admin/bills/paymentdetails.route.js");

// const productRoute = require("./product/product.route.js");
// const inventoryRoute = require("./product/Inventory.route.js");

// const venderRoute = require("./vender/vender.route.js");
// const saleRoute = require("./vender/sales.route.js");

// const customerRoute = require("./customer/customer.route.js");

// const PaymentRoute = require("./payment.js");
// const emailRoute = require("./emailmgt.js");
// const emailactivationRoute = require("./emailactivation.js");

// const PORT = process.env.PORT || 9876;

// // MIDDLEWARE
// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// // STATIC FOLDER
// app.use(
//   "/productimages",
//   express.static(path.join(__dirname, "product/productimages"))
// );

// // ROUTES
// app.use("/state", stateRoute);
// app.use("/city", cityRoute);
// app.use("/productcatg", productcatgRoute);
// app.use("/product", productRoute);
// app.use("/inventory", inventoryRoute);

// app.use("/vender", venderRoute);
// app.use("/sales", saleRoute);

// app.use("/customer", customerRoute);

// app.use("/bill", billRoute);
// app.use("/paymentdetails", paymentdetailsRoute);

// app.use("/payment", PaymentRoute);
// app.use("/email", emailRoute);
// app.use("/emailactivation", emailactivationRoute);

// // DATABASE
// mongoose
//   .connect(config.URL, { useNewUrlParser: true })
//   .then(() => console.log("DATABASE IS CONNECTED"))
//   .catch((err) => console.log("DB ERROR:", err));

// // SERVER
// app.listen(PORT, () => {
//   console.log("SERVER RUNNING ON PORT " + PORT);
// });
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const config = require("./DB.js");

// ROUTES
const stateRoute = require("./admin/state.route.js");
const cityRoute = require("./admin/city.route.js");
const productcatgRoute = require("./admin/productcatg.route.js");
const billRoute = require("./admin/bills/bill.route.js");
const paymentdetailsRoute = require("./admin/bills/paymentdetails.route.js");

const productRoute = require("./product/product.route.js");
const inventoryRoute = require("./product/Inventory.route.js");

const venderRoute = require("./vender/vender.route.js");
const saleRoute = require("./vender/sales.route.js");

const customerRoute = require("./customer/customer.route.js");

const PaymentRoute = require("./payment.js");
const emailRoute = require("./emailmgt.js");
const emailactivationRoute = require("./emailactivation.js");

const PORT = process.env.PORT || 9876;

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// TEST ROUTE (important)
app.get("/", (req, res) => {
  res.send("Backend working");
});

// STATIC FOLDER
app.use(
  "/productimages",
  express.static(path.join(__dirname, "product/productimages"))
);

// ROUTES
app.use("/state", stateRoute);
app.use("/city", cityRoute);
app.use("/productcatg", productcatgRoute);
app.use("/product", productRoute);
app.use("/inventory", inventoryRoute);
app.use("/vender", venderRoute);
app.use("/sales", saleRoute);
app.use("/customer", customerRoute);
app.use("/bill", billRoute);
app.use("/paymentdetails", paymentdetailsRoute);
app.use("/payment", PaymentRoute);
app.use("/email", emailRoute);
app.use("/emailactivation", emailactivationRoute);

// DATABASE
mongoose
  .connect(config.URL)
  .then(() => console.log("DATABASE IS CONNECTED"))
  .catch((err) => console.log("DB ERROR:", err));

// SERVER
app.listen(PORT, () => {
  console.log("SERVER RUNNING ON PORT " + PORT);
});
