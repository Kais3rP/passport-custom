"use strict";
//In this exercise we won't be using mongoose, but pure mongodb API
const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");

const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');


const mongoDb = require('mongodb');
const mongo = mongoDb.MongoClient;// This connects to mongodb 
const ObjectId = mongoDb.ObjectID;

const bcrypt = require ('bcrypt');

const routes = require ('./routes.js');
const auth = require ('./auth.js');

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
/* Initialize a session to store the passport credentials server side */
app.use(passport.initialize());
app.use(passport.session());

//Using mongo db api, all the operations you want to do in db you have to inside the callback of mongo.connect(MONGO_URI, cb(err,db))
mongo.connect(process.env.MONGO_URI, { useUnifiedTopology: true }, (err, client) => {  
  var db = client.db('users-db'); //In MongoDB 3+ you need to declare db like this
  if(err) throw ('Database error: ' + err);
  console.log('Successful database connection');
  
/* serialize and deserialize are intialized so they are called during registration or login to write/read the id on client cookie req.user*/
  passport.serializeUser((user,done) => {
  done(null, user._id);
})
  passport.deserializeUser((id,done) => {
   db.collection('users').findOne(
    {_id: new ObjectId(id)},
      (err, doc) => {
        done(null, doc);
      })
    });
    
    //-----Here we manage the strategy of authentication---------------

    passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
   let user = await db.collection('users').findOne({ username: username });
          console.log('User '+ username +' attempted to log in.');
     
          if (!user) { console.log('User non registered');return done(null, false); }
         let passwordIsValid = await bcrypt.compareSync(password, user.password);
         if (!passwordIsValid) { console.log('Wrong Password'); return done(null, false);} //password wrong { return done(null, false); }
          return done(null, user); } catch {
            return done(err)
          }
     
        })
                 );
    
//---------------------o--------------------------

  routes(app,)

//Server listening
app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});

    
/* This middleware ensures that the request is authenticated before redirecting to /profile route*/
  function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};
});