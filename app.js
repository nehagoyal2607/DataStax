const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");
const expressSanitizer = require("express-sanitizer");
const bcrypt = require("bcrypt");
const users = require("./models/user");
const signs = require("./models/sign");
const webs = require('./models/webinar');
const threads = require('./models/thread');
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
app.get("/pagination", function(req, res){
	res.render("pagination");
})
app.get("/webinar", async function(req, res){
	const webinars = await webs.getWebinars();
	// console.log(webinars);
	res.render("webinar", {webinars:webinars});
})
app.get("/webinar/:id", async function(req, res){
	res.render("live", {meetingId:req.params.id});
})
app.get("/translate", async function(req, res){
	const data = await signs.getSign();
	// console.log(data[0]);
	res.render("translate", {sample: data[0]});
})
app.get("/translateTwo", async function(req, res){
	const data = await signs.getSign();
	// console.log(data[0]);
	res.render("translateTwo", {sample: data[0]});
})
app.get("/progress", async function(req, res){
	const userData = await users.getUsers();
	userData.sort(function (a, b) {
		return b.score - a.score;
	  });
	res.render("progress", {users:userData});
})
app.get("/profile", isLoggedIn, async function(req, res){
	const signData = await signs.getSign();
	const userData = await users.getUserById(req.session.user_id);
	const usersData = await users.getUsers();
	usersData.sort(function (a, b) {
		return b.score - a.score;
	  });
	res.render("profile", {signs:signData[0], user:userData, users:usersData});
})
app.get("/dash", isLoggedIn, async function(req, res){
	const data = await signs.getSign();

	res.render("dash", {sample: data[0]});
})
// app.get("/inner-page", function(req, res){
// 	res.render("inner-page", {symb: symbolll});
// })
// let symbolll = -1;
app.get("/practice/:symbol", isLoggedIn, async function(req, res){
	// symbolll = req.params.symbol;
	const data = await signs.getSign();
	const user = await users.getUserById(req.session.user_id);
	res.render("inner-page", {sample:data[0], symb: req.params.symbol, user});
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
	res.redirect("/");
})
app.post("/update", async function(req, res){
	await users.updateScore(req.session.user_id, req.body.score, req.body.symbol);
	console.log("updated");
})
app.post("/addWebinar", async function(req, res){
	const newWeb = await webs.addWebinar({
		title:req.body.title,
		meetingId:req.body.meetingId,
		timings:req.body.timings,
		host:req.body.host,
		description: req.body.description
	})
	res.redirect("/webinar");
})
app.post("/forum", isLoggedIn, async function(req, res){
	const user = await users.getUserById(req.session.user_id);
	const author = user.username;
	await threads.addThread({
		title:req.body.title,
		description:req.body.description,
		author:author
	})
	res.redirect("/forum");
})
app.get("/forum", isLoggedIn, async function(req, res){
	const threadData = await threads.getThreads();
	res.render("forum", {threads:threadData});
})
app.post("/forum/:id/addComment", isLoggedIn, async function(req, res){
	const user = await users.getUserById(req.session.user_id);
	const author = user.username;
	await threads.addComment(req.params.id, {
		title:req.body.title,
		description:req.body.description,
		author:author
	})
	res.redirect("/forum/"+req.params.id);
})
app.get("/forum/:id", isLoggedIn, async function(req, res){
	const data = await threads.getThreadByTitle(req.params.id);
	res.render("comments", {data:data});
})
app.get("/", async function(req, res){
	// await users.deleteUser();
	// const sample = await users.getUsers();
	// console.log(sample);
	// console.log(req.session.user_id);
	// const updated = await users.updateScore(req.session.user_id, 80);
	// console.log(updated);
	// const currentUser = await users.getUserById(req.session.user_id);
	// console.log(currentUser);

	// const sample = await signs.getSign();
	// console.log(sample);
	// await threads.deleteThreads();
	if(req.session.user_id!=null){
		res.redirect("dash");
	} else{
		res.render("index");
	}
  	
})

app.listen(3000, process.env.IP, function(){
	console.log("App is running.");
})