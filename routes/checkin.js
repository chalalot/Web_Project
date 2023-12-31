// RMIT University Vietnam
//  Course: COSC2430 Web Programming
//  Semester: 2023A
//  Assessment: Assignment 2
//  Author: Dong Manh Duc, Do Thuy Linh, Le Nguyen My Chau, Nguyen Ba Duc Manh, Tran Tuan Trung
//  ID: s3977747, s3927777, s3978165, s3978506, s3978290
//  Acknowledgement: Pedro Tech, Web Dev Simplified.

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Encrypt password
const User = require("./../models/user.js");
const Hub = require("./../models/hub.js");
const { validateRegistration } = require("./../config/validator.js");
const { validationResult } = require("express-validator");
const passport = require("passport");

// Set up passport.js
const initializePassport = require("./../config/passport-config.js");
initializePassport(passport);

router.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("checkin/login.ejs");
});

router.get("/customer-register", checkNotAuthenticated, (req, res) => {
  res.render("checkin/customer-register.ejs", {});
});

router.get("/vendor-register", checkNotAuthenticated, (req, res) => {
  res.render("checkin/vendor-register");
});

// When render shipper also pass in a list of available hubs
router.get("/shipper-register", checkNotAuthenticated, async (req, res) => {
  const hubs = await Hub.find();
  res.render("checkin/shipper-register", { hubs: hubs });
});

router.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/checkin/login",
    failureFlash: true,
  }),
);

// Check if not authenticated
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // Redirect to home page if authenticated
    return res.redirect("/");
  }
  next();
}

// 3 different post routes for 3 different type of users
// Create new instance in db and hash password
router.post(
  "/customer-register",
  checkNotAuthenticated,
  validateRegistration,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Redirect back to register page with error
      return res.render("checkin/customer-register", {
        errors: errors.array(),
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let customer = new User.Customer({
        username: req.body.username,
        password: hashedPassword,
        name: req.body.name,
        address: req.body.address,
      });

      try {
        await customer.save();
        // Redirect to login page
        res.redirect("/checkin/login");
      } catch (e) {
        if (e.code === 11000 || e.code === 11001) {
          return res.render("checkin/customer-register", {
            errors: [{ msg: "Account already exists" }],
          });
        }
      }
    } catch {
      res.redirect("/checkin/customer-register");
    }
  },
);

router.post(
  "/vendor-register",
  checkNotAuthenticated,
  validateRegistration,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Redirect back to register page with error
      return res.render("checkin/vendor-register", {
        errors: errors.array(),
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let vendor = new User.Vendor({
        username: req.body.username,
        password: hashedPassword,
        businessName: req.body.businessName,
        businessAddress: req.body.businessAddress,
      });

      try {
        await vendor.save();
        // Redirect to login page
        res.redirect("/checkin/login");
      } catch (e) {
        if (e.code === 11000 || e.code === 11001) {
          return res.render("checkin/vendor-register", {
            errors: [{ msg: "Account already exists" }],
          });
        }
      }
    } catch (e) {
      res.redirect("/checkin/vendor-register");
    }
  },
);

router.post(
  "/shipper-register",
  checkNotAuthenticated,
  validateRegistration,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Redirect back to register page with error
      const hubs = await Hub.find();
      return res.render("checkin/shipper-register", {
        errors: errors.array(),
        hubs: hubs,
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let shipper = new User.Shipper({
        username: req.body.username,
        password: hashedPassword,
        hub: req.body.hub,
      });

      try {
        await shipper.save();
        // Redirect to login page
        res.redirect("/checkin/login");
      } catch (e) {
        if (e.code === 11000 || e.code === 11001) {
          const hubs = await Hub.find();
          return res.render("checkin/shipper-register", {
            hubs: hubs,
            errors: [{ msg: "Account already exists" }],
          });
        }
      }
    } catch (e) {
      res.redirect("/checkin/shipper-register");
    }
  },
);

// Logout
router.delete("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect("/checkin/login");
  });
});
// Export router
module.exports = router;
