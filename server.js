"use strict";
//In this exercise we won't be using mongoose, but pure mongodb API
const express = require("express");
const fccTesting = require("./freeCodeCamp/fcctesting.js");

const app = express();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');


const mongo = require('mongodb').MongoClient; // This connects to mongodb 
const ObjectID = mongo.ObjectID;

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

//Using mongo db api, all the operations you want to do in db you have to inside the callback of mongo.connect(MONGO_URI, cb(err,db))
mongo.connect(process.env.MONGO_URI, { useUnifiedTopology: true }, (err, client) => {  
  var db = client.db('users-db'); //In MongoDB 3+ you need to declare db like this
  if(err) throw ('Database error: ' + err);
  console.log('Successful database connection');

   passport.serializeUser((user,done) => {
  done(null, user._id);
})
passport.deserializeUser((id,done) => {
  console.log(client);
   db.collection('users').findOne(
    {_id: new ObjectID(id)},
      (err, doc) => {
        done(null, doc);
      })
    });
    
    //-----Here we manage the strategy of authentication---------------

    passport.use(new LocalStrategy(
      function(username, password, done) {
        db.collection('users').findOne({ username: username }, function (err, user) {
          console.log('User '+ username +' attempted to log in.');
          console.log(user)
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (password !== user.password) { return done(null, "Password wrong"); }
          return done(null, user);
        });
      }
    ));
//---------------------o--------------------------
    



app.route("/").get((req, res) => {  //rendering of templates
  //Change the response to render the Pug template
  res.render(process.cwd()+'/views/pug/index', {title: 'Hello', message: 'Please login', showLogin: true}); //process.cwd() returns the directory of the current node process
});

app.post('/login', passport.authenticate('local', { successRedirect: '/profile',
                                   failureRedirect: '/' }), function(req,res){
  
})
app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});

    
      
});