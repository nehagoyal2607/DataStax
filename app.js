const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");
const passport = require("passport");
const expressSanitizer = require("express-sanitizer");
const LocalStrategy = require("passport-local");
const astra = require("./models/astra");
// const User = async()=>{
// 	return await astra.getColorsCollection();
// }
// const User;
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
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


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
app.post("/login", async function(req, res){
	const sample = await astra.getColorHistory();
	let flag = false;
	for(let i = 0; i<sample.length; i++){
		if(sample[i].name==req.body.username && sample[i].value==req.body.password){
			flag = true;
			break;
		}
	}
	if(flag){
		console.log("FOUND");
	} else{
		console.log("NOT FOUND");
	}
})
// app.post("/login",passport.authenticate("local",{
// 	failureRedirect:"/home"
// }),(req,res) => {
// 	User.findById(req.user._id);
// 	var redirectionUrl = req.session.redirectUrl || '/home';
// 	res.redirect(redirectionUrl);
// });


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
	// await astra.deleteColorHistory();
	await astra.addColorHistory({
		name: req.body.username,
		value: req.body.password,
	});
	const sample = await astra.getColorHistory();
	console.log("registered");
	console.log(sample);
})
app.get("/", async function(req, res){
	await astra.addColorHistory({
		name: "yellow",
		value: 1,
	  });
	const sample = await astra.getColorHistory();
	console.log(sample);
  res.send("Hi");
})
app.listen(3000, process.env.IP, function(){
	console.log("App is running.");
})