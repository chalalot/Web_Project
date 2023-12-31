// RMIT University Vietnam
// Course: COSC2430 Web Programming
// Semester: 2023A
// Assessment: Assignment 2
// Author: Dong Manh Duc, Do Thuy Linh, Le Nguyen My Chau, Nguyen Ba Duc Manh, Tran Tuan Trung
// ID: s3977747, s3927777, s3978165, s3978506, s3978290
// Acknowledgement: Pedro Tech, Web Dev Simplified.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema({
  name: {
    type: String,
    required: true,
    minLength: [10, "Name length must be between 10 and 20"],
    maxLength: [20, "Name length must be between 10 and 20"],
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price must be higher than 0"],
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxLength: [500, "Description character count must be below 500"],
  },
});

const orderSchema = Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],
  address: {
    // Get directly users address
    type: String,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "delivered", "canceled"],
    default: "active",
  },
});

const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

module.exports = {
  Product,
  Order,
};
