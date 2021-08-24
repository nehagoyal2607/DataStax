const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");
const passport = require("passport");
const expressSanitizer = require("express-sanitizer");
const LocalStrategy = require("passport-local");
const users = require("./models/user");
const signs = require("./models/sign");

const User = async()=>{
	return await users.getUsersCollection();
}

require('dotenv').config();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(express.json())
app.use(expressSanitizer());

app.use(session({
	secret:"Our first datastax app",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());



passport.use(new LocalStrategy(
	async function(username, password, done) {
	  await User.findOne({ username: username }, function (err, user) {
		if (err) { return done(err); }
		if (!user) { return done(null, false); }
		if (!user.verifyPassword(password)) { return done(null, false); }
		return done(null, user);
	  });
	}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({id:id}, function(err, user) {
    done(err, user);
  });
});

// const isLoggedIn = function(req,res,next){
// 	if(!req.isAuthenticated() || !req.isAuthenticated){
// 		if(req.session){
// 			req.session.redirectUrl = req.headers.referer || req.originalUrl || req.url;
// 		}
// 		res.redirect('/login');
// 	}else{
// 		next();
// 	}
// }


app.get("/login", function(req, res){
	res.render("login");
})
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
	  console.log("Successful log in");
    res.redirect('/');
});

app.get("/register", function(req, res){
	res.render("register");
})
// app.post("/register",(req,res) => {
// 	let newUser = new User({username:req.body.username});
// 	User.register(newUser, req.body.password, (err,user) => {
// 		if(err){
// 			console.log(err);
// 			return res.redirect("back")
// 		}
// 		passport.authenticate("local")(req,res,() => {
//     		res.redirect("/");
// 		})
// 	})
// })
app.post("/register", async function(req, res){

	let newUser = await users.addUser({
		name: req.body.username,
		password: req.body.password,
	});
	
	// User.register(newUser, req.body.password, (err,user) => {
	// 	if(err){
	// 		console.log(err);
	// 		return res.redirect("back")
	// 	}
	// 		passport.authenticate("local")(req,res,() => {
	// 		res.redirect("/");
	// 	})
	// })
	console.log("registered");
})
app.get("/", async function(req, res){
  	res.send("Hi");
})

app.listen(3000, process.env.IP, function(){
	console.log("App is running.");
})