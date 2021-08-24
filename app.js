const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");
const passport = require("passport");
const expressSanitizer = require("express-sanitizer");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const users = require("./models/user");
const signs = require("./models/sign");


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

app.get("/login", function(req, res){
	res.render("login");
})
app.post("/login", async(req, res)=>{
	const {username, password} = req.body;
	const user = await users.getUserByName(username);
	const validPassword = await bcrypt.compare(password, user.password);
	if(validPassword){
		req.session.user_id = user.id;
		
		res.redirect("/");
	}else{
		// console.log("fail");
		res.redirect("/login");
	}
})

app.get("/register", function(req, res){
	res.render("register");
})

app.post("/register", async function(req, res){
	const user = await users.getUserByName(req.body.username);
	// console.log(user);
	if(!user){
		const {password, username} = req.body;
		const hash = await bcrypt.hash(password, 12);

		const newUser = await users.addUser({
			username: username,
			password: hash,
		});

		req.session.user_id = newUser.id;
		console.log("registered");
		res.redirect("/");
	}else{
		console.log("Already exists");
	}
	
})
app.post("/logout", (req, res)=>{
	res.session.user_id = null;
	res.redirect("/login");
})
app.get("/", async function(req, res){

  	res.send("Hi");
})

app.listen(3000, process.env.IP, function(){
	console.log("App is running.");
})