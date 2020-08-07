const mongoDb = require("mongodb");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ObjectId = mongoDb.ObjectID;
const bcrypt = require("bcrypt");
const session = require("express-session");

module.exports = function(app, db) {
  //----- using the express-session() middleware to save on cookies the token of the visitor and verify it with the secret key on server, similar to JWT----
  //session() has to be used before passport.session() middleware to restore the correct login  order
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true
    })
  );

  //----- using Passport to manage logins credentials -----
  /* Initialize a session to store the passport credentials server side */
  app.use(passport.initialize());
  app.use(passport.session());

  /* serialize and deserialize are intialized so they are called during registration or login to write/read the id on client cookie req.user*/
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    db.collection("users").findOne({ _id: new ObjectId(id) }, (err, doc) => {
      done(null, doc);
    });
  });

  //-----Here we manage the strategy of authentication---------------

  passport.use(
    new LocalStrategy(async function(username, password, done) {
      try {
        let user = await db.collection("users").findOne({ username: username });
        console.log("User " + username + " attempted to log in.");

        if (!user) {
          console.log("User non registered");
          return done(null, false);
        }
        let passwordIsValid = await bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
          console.log("Wrong Password");
          return done(null, false);
        } //password wrong { return done(null, false); }
        return done(null, user);
      } catch {
        return done("Error");
      }
    })
  );
};
