
// google-oauth-app/backend/routes/index.js

var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" }); // You might want to change this to a JSON response or redirect
});

module.exports = router;
