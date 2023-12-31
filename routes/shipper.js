// RMIT University Vietnam
//  Course: COSC2430 Web Programming
//  Semester: 2023A
//  Assessment: Assignment 2
//  Author: Dong Manh Duc, Do Thuy Linh, Le Nguyen My Chau, Nguyen Ba Duc Manh, Tran Tuan Trung
//  ID: s3977747, s3927777, s3978165, s3978506, s3978290
//  Acknowledgement: Pedro Tech, Web Dev Simplified.

const express = require("express");
const router = express.Router();
const Product = require("./../models/product.js");
const User = require("./../models/user.js");

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // If authenticated then move to the next task
  }
  // Redirect to login page
  res.redirect("/checkin/login");
}

router.get("/:id", checkAuthenticated, async (req, res) => {
  try {
    const order = await Product.Order.findById(req.params.id).populate(
      "products.product",
    );
    const customer = await User.Customer.findById(order.customer);
    // Prevent users from going back to non active orders    
    if (!order || order.status !== "active") {
      return res.redirect("/");
    }
    res.render("shipper/order.ejs", {
      order: order,
      customer: customer,
      user: req.user,
    });
  } catch (e) {
    console.log(e);
    res.redirect("/");
  }
});

router.get("/product/:id", checkAuthenticated, async (req, res) => {
  try {
    const product = await Product.Product.findById(req.params.id);
    if (!product) {
      return res.redirect("/");
    }
    const vendor = await User.Vendor.findById(product.vendor);
    res.render("shipper/product.ejs", {
      product: product,
      vendor: vendor,
      user: req.user,
    });
  } catch (e) {
    console.log(e);
    res.redirect("/");
  }
});

router.post("/:id", checkAuthenticated, async (req, res) => {
  try {
    // Convert the submit value
    const value =
      req.body.submit.charAt(0).toLowerCase() + req.body.submit.slice(1);
    await Product.Order.findByIdAndUpdate(
      req.params.id,
      { status: value },
      { new: true },
    );

    res.redirect("/"); // Refresh main page
  } catch (e) {
    console.log(e);
    res.redirect("/");
  }
});

module.exports = router;
