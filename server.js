"use strict";
//In this exercise we won't be using mongoose, but pure mongodb API
const express = require("express");
const app = express();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoDb = require("mongodb");
const mongo = mongoDb.MongoClient; // This connects to mongodb
const ObjectId = mongoDb.ObjectID;
const bcrypt = require("bcrypt");
const routes = require("./routes.js");
const auth = require("./auth.js");

app.set("view engine", "pug"); //Sets pug as template engine
//---- accessing files on public and parsing bodies of requests
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // body parsing

//Using mongo db api, all the operations you want to do in db you have to inside the callback of mongo.connect(MONGO_URI, cb(err,db))
mongo.connect(
  process.env.MONGO_URI,
  { useUnifiedTopology: true },
  (err, client) => {
    var db = client.db("users-db"); //In MongoDB 3+ you need to declare db like this
    if (err) throw "Database error: " + err;
    console.log("Successful database connection");

    //Imports all the auth operations
    auth(app, db);
    //---------------------o--------------------------
    //Imports all the routes
    routes(app, db);

    //Server listening
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
    });
  }
);
