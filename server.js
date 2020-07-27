"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");

const app = express();

app.set('view engine', 'pug'); //Sets pug as template engine
fccTesting(app); //For FCC testing purposes

app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.route("/").get((req, res) => {
  //Change the response to render the Pug template
  res.render(process.cwd()+'/views/pug/index', {title: 'Hello', message: 'Please login'}); //process.cwd() returns the directory of the current node process
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});
