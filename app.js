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
const sign = require("./models/sign");


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

app.use(async function(req,res,next){
	const currentUser = await users.getUserById(req.session.user_id);
	res.locals.currentUser = currentUser;
	// console.log(currentUser);
	next();
})

const isLoggedIn = function(req,res,next){
	if(!req.session.user_id){
		// if(req.session){
		// 	req.session.redirectUrl = req.headers.referer || req.originalUrl || req.url;
		// }
		res.redirect('/login');
	}else{
		next();
	}
}
app.get("/login", function(req, res){
	res.render("login");
})
// app.get("/inner", function(req, res){
// 	res.render("inner-page");
// })
app.get("/index", function(req, res){
	res.render("index");
})
app.get("/dash", isLoggedIn, async function(req, res){
	const data = await signs.getSign();

	res.render("dash", {sample: data[0]});
})
// app.get("/inner-page", function(req, res){
// 	res.render("inner-page", {symb: symbolll});
// })
// let symbolll = -1;
app.get("/practice/:symbol", function(req, res){
	// symbolll = req.params.symbol;
	res.render("inner-page", {symb: req.params.symbol});
})
app.post("/login", async(req, res)=>{
	const {username, password} = req.body;
	
	const user = await users.getUserByName(username);
	if(user == null || user.length == 0){
		console.log("doesn't exist");
		res.redirect("/login");
	}else{
		const validPassword = await bcrypt.compare(password, user.password);
		if(validPassword){
			req.session.user_id = user.id;
			console.log(user.id);
			var redirectionUrl ='/dash';
			res.redirect(redirectionUrl);

		}else{
			console.log("fail");
			res.redirect("/login");
		}
	}
	// console.log(user);
	
})

app.get("/register", function(req, res){
	res.render("register");
})

app.post("/register", async function(req, res){
	const user = users.getUserByName(req.body.username);
	
		const {password, username} = req.body;
		const hash = await bcrypt.hash(password, 12);

		const newUser = await users.addUser({
			username: username,
			password: hash,
		});

		req.session.user_id = newUser.id;
		console.log("registered");
		res.redirect("/");
	
		
})
app.get("/logout", (req, res)=>{
	req.session.user_id = null;
	res.redirect("/login");
})
app.get("/", async function(req, res){
	// const sample = await users.getUsers();
	// console.log(sample);
	// console.log(req.session.user_id);
	// const currentUser = await users.getUserById(req.session.user_id);
	// console.log(currentUser);
	// const sample = await signs.getSign();
	// console.log(sample[0].alphabet);
	// await signs.deleteSign();
	// await signs.addSign()
	// await signs.addSign({
	// 	alphabet: [
	// 		'a', 'b', 'c', 'd', 'e', 'f',
	// 		'g', 'h', 'i', 'j', 'k', 'l',
	// 		'm', 'n', 'o', 'p', 'q', 'r',
	// 		's', 't', 'u', 'v', 'w', 'x',
	// 		'y', 'z'],
	// 	alpImg: ["https://i.ibb.co/H7kcvTK/a.png","https://i.ibb.co/x2BcV0j/b.png","https://i.ibb.co/ZTcBCND/c.png","https://i.ibb.co/zVDPdqH/d.png","https://i.ibb.co/BPpJNYX/e.png","https://i.ibb.co/N7GmhKs/f.png","https://i.ibb.co/5MBGCgp/g.png","https://i.ibb.co/BT5C00j/h.png","https://i.ibb.co/hgnh0xK/i.png","https://i.ibb.co/vXvtgbH/j.png","https://i.ibb.co/kxqHKWK/k.png","https://i.ibb.co/zZ22HbZ/l.png","https://i.ibb.co/J7gy1Kv/m.png","https://i.ibb.co/khpsDFz/n.png","https://i.ibb.co/09KBjYT/o.png","https://i.ibb.co/j3D1kz8/p.png","https://i.ibb.co/4fyG1y5/q.png","https://i.ibb.co/PtzqsT7/r.png","https://i.ibb.co/S5PMgbZ/s.png","https://i.ibb.co/Gn0sHr9/t.png","https://i.ibb.co/p2P1W94/u.png","https://i.ibb.co/z2FZ2RZ/v.png","https://i.ibb.co/f00HcvS/w.png","https://i.ibb.co/nPCgP8v/x.png","https://i.ibb.co/2hYrrMn/y.png","https://i.ibb.co/3dN6wYW/z.png"],
	// });
	// const sample = await signs.getSign();
	// console.log(sample);
  	res.render("index");
})

app.listen(3000, process.env.IP, function(){
	console.log("App is running.");
})