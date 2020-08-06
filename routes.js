const passport = require('passport');
const bcrypt = require ('bcrypt');

module.exports = function (app, db) {

  /* Starting the routes */

//Main route
app.route("/").get((req, res) => {  
  //Rendering of templates
  //Change the response to render the Pug template
  console.log(req.user)
  res.render(process.cwd()+'/views/pug/index', {title: 'Home Page', message: 'Please login', showLogin: true, showRegistration: true}); //process.cwd() returns the directory of the current node process
});

app.route('/register').post(async (req,res)=>{
  try {
  let user = await db.collection('users').findOne({username: req.body.username});
   if (user) return res.redirect('/')
    //If user doesn't exist we create one
    let hashedPwd = bcrypt.hashSync(req.body.password, 8); //crpyting pwd
    let userDb = await db.collection('users').insertOne({
          username: req.body.username,
          password: hashedPwd
        });
    console.log(userDb)
    let autenthication = await passport.authenticate('local', { failureRedirect: '/' });
    res.redirect('/profile')
  } catch {
    console.log("Error retrieving/creating user from the db")
    return res.redirect('/')
  }
})
  
  //Login route when trying to login
app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req,res) =>{
  res.redirect("/profile");
});
  
  //Profile route when login succedeed
  app.route('/profile').get(ensureAuthenticated, (req,res) => {
   res.render(process.cwd() + '/views/pug/profile', { username: req.user.username });
});
  
  app.route('/logout').get((req,res)=>{
    req.logout(); //This method is directly managed by passport
    res.redirect('/');
  })
}