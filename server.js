"use strict";

const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");

const app = express();
const passport = require('passport');
const session = require('express-session');

const db = require('mongodb');

app.set('view engine', 'pug'); //Sets pug as template engine
fccTesting(app); //For FCC testing purposes

//---- accessing files on public and parsing bodies of requests

app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));// body parsing

//----- using the express-session() middleware to save on cookies the token of the visitor and verify it with the secret key on server, similar to JWT----
//session() has to be used before passport.session() middleware to restore the correct login  order
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

//----- using Passport to manage logins credentials -----

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.serializeuser((user,done) => {
  done(null, user._id);
}))
app.use(passport.deserializeUser((id,done) => {
  
}))
app.route("/").get((req, res) => {  //rendering of templates
  //Change the response to render the Pug template
  res.render(process.cwd()+'/views/pug/index', {title: 'Hello', message: 'Please login'}); //process.cwd() returns the directory of the current node process
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});

function done (err, data){
  console.log(err ? err : data)
}