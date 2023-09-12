if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const flash = require("express-flash");
const session = require("express-session");
const checkinRouter = require("./routes/checkin.js");
const profileRouter = require("./routes/profile.js");
const vendorRouter = require("./routes/vendor.js");
const passport = require("passport");
const methodOverride = require("method-override");
const cors = require("cors"); // for searching
const dbConnect = require("./config/db.js");
const customerRouter = require("./routes/customer.js");
const Product = require("./models/product.js");
const Hub = require("./models/hub.js");

// Set up mongoose
require("./config/db.js");
dbConnect();
// Set up express
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(cors());
app.use(express.json());

// connect to public
app.use(express.static("public"));
// Connect to images
app.use("/uploads", express.static("uploads"));

// Prevent users from going back
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Check if user authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // If authenticated then move to the next task
  }
  // Redirect to login page
  res.redirect("/checkin/login");
}

// Index page: Change later
app.get("/", checkAuthenticated, async (req, res) => {
  // Already login
  try {
    if (req.user.__t === "Vendor") {
      const products = await Product.Product.find({ vendor: req.user._id });
      res.render("vendor/index.ejs", { user: req.user, products: products });
    } else if (req.user.__t === "Customer") {
      const products = await Product.Product.find();
      res.render("customer/index.ejs", { user: req.user, products: products });
    } else if (req.user.__t === "Shipper") {
      const hubWithOrders = await Hub.findById(req.user.hub).populate(
        "orders.order",
      );
      const orders = hubWithOrders.orders
        .filter((orderObject) => orderObject.order !== null) // Filter out null orders
        .map((orderObject) => orderObject.order);

      res.render("shipper/index.ejs", { user: req.user, orders: orders });
    }
  } catch (e) {
    console.log(e);
    res.redirect("/checkin/login");
  }
});

// Set up router
app.use("/checkin", checkinRouter);
app.use("/profiles", profileRouter);
app.use("/vendor", vendorRouter);
app.use("/customer", customerRouter);

// Run on port 3000
app.listen(3000);
