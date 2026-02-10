const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  pid: Number,
  pname: String,
  pprice: Number,
  oprice: Number,

  // Cloudinary image URL
  ppicurl: String,

  pcatgid: Number,
  vid: Number,
  status: {
    type: String,
    default: "Inactive",
  },
});

module.exports = mongoose.model("Product", productSchema);
