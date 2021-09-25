const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");
const expressSanitizer = require("express-sanitizer");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const fp = require("fingerpose");
const users = require("./models/user");
const signs = require("./models/sign");
const webs = require('./models/webinar');
const threads = require('./models/thread');
const wordsmodel = require('./models/words');
const words = require("./models/words");

require('dotenv').config();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use('/node_modules',express.static(__dirname+'/node_modules'))
app.use(express.json())
app.use(expressSanitizer());
app.use(flash());
app.use(session({
	secret:"Our first datastax app",
	resave:false,
	saveUninitialized:false
}));

app.use(async function(req,res,next){
	const currentUser = await users.getUserById(req.session.user_id);
	res.locals.currentUser = currentUser;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
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
app.get("/pagination", async function(req, res){
	const sample = await words.getSign();
	res.render("pagination", {words: sample});
})
app.get("/webinar", isLoggedIn, async function(req, res){
	const webinars = await webs.getWebinars();
	// console.log(webinars);
	res.render("webinar", {webinars:webinars});
})
app.get("/webinar/:id", isLoggedIn, async function(req, res){
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
app.get("/progress", isLoggedIn, async function(req, res){
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
	// console.log(user);
	res.render("inner-page", {sample:data[0], symb: req.params.symbol, user});
})
app.post("/login", async(req, res)=>{
	const {username, password} = req.body;
	
	const user = await users.getUserByName(username);
	if(user == null || user.length == 0){
		req.flash("error", "User doesn't exist")
		console.log("doesn't exist");
		res.redirect("/login");
	}else{
		const validPassword = await bcrypt.compare(password, user.password);
		if(validPassword){
			req.session.user_id = user.id;
			console.log(user.id);
			// req.flash("success", "Successfully Logged In.")
			var redirectionUrl ='/dash';
			res.redirect(redirectionUrl);

		}else{
			console.log("fail");
			req.flash("error", "Incorrect username or password")
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
			// req.flash("success", "Successfully Registered.")
			console.log("registered");
			res.redirect("/dash");
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
app.get("/gesture", async function(req, res){
	res.render("gesture", {fp:fp});
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
	// await webs.deleteWebinars();
	// await threads.deleteThreads();
	// const sample = await words.getSign();
	// console.log(sample);
	// await wordsmodel.addSign({
	// 	link: [
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/10-pub.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/14-sun.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/15-car.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/16-rainbow.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/19-book.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/20-gold.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/21-equality.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/23-greetings.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/24-weekend.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/25-scotland.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/26-winter.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/27-support.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/30-read.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/31-relax.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/6-rain.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/7-birthday.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/1/9-afternoon.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/1-apple.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/10-person.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/12-mountain.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/14-monkey.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/15-tree.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/17-reindeer.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/18-stocking.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/19-snow.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/20-gift.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/21-santa.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/22-elf.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/27-Happy%20Christmas.jpg",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/31-Happy%20New%20Year.jpg",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/4-biscuit.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/5-black.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/7-sugar.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/8-chocolate.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2014/12/9-tie.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/1-Happy%20New%20Year.jpg",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/10-music.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/11-milk.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/12-sugar.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/13-duck.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/14-pet.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/15-icecream.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/17-give_up.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/18-bear.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/19-popcorn.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/2-science.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/20-penguin.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/21-squirrel.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/22-cat.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/23-pie.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/24-nut.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/25-opposite.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/26-spouse.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/27-cake.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/28-pancake.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/29-jigsawPuzzle.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/3-art.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/30-pastry.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/31-gorilla.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/4-blind.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/5-bird.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/6-biscuit.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/7-tea.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/1/8-bath.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/1-snake.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/10-rain.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/11-friend.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/13-library.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/14-love.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/17-pancake.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/20-pie.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/21-egg.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/22-dog.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/22-walk.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/23-banana.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/24-crisps.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/25-cherry.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/26-nut.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/27-bear.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/28-fairy.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/3-cake.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/4-friend.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/5-chocolate.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/6-chewing%20gum.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/7-iceCream.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/8-music.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/2/9-book.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/1-pig.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/10-gorilla.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/17-ireland.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/21-happy.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/22-water.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/23-dog.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/24-raisins.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/25-lunch.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/26-purple.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/27-fruit.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/28-weeds.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/29-moon.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/3-music.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/5-name.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/8-woman.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/3/9-sleep.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/4/11-pet.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/4/23-england.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/4/3-party.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/4/30-plant.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/4/7-health.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/11-technology.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/13-irish.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/16-swim.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/17-cake.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/18-museum.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/19-money.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/2-baby.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/21-photo.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/22-ship.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/23-turtle.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/24-brother.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/26-barbecue.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/27-sun.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/29-biscuit.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/5-deaf.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/5/7-vote.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/1-sugar.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/10-cow.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/11-tent.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/13-mountain.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/14-flag.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/15-camera.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/16-horse.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/17-barbecue.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/18-fish.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/19-shoes.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/2-chocolate.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/27-sun.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/3-exercise.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/4-clothing.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/5-doughnut.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/6-art.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/7-milk.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/8-friend.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/6/9-tree.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/7/1-funny.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/7/2-ice%20cream.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/7/21-swimming.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/7/27-rain.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/7/31-sun.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/7/4-america.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/8/10-apple.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/8/18-hello.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/8/24-knife.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/8/25-exercise.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/8/26-dog.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/8/27-meat.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/8/28-tie.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/8/5-sun.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/9/1-whale.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/9/12-tv.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/9/16-family.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/9/17-music.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/9/24-fruit.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/9/29-moon.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/9/4-school.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/9/6-book.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/9/6-sausages.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/9/9-bear.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/1-moon.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/10-what.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/14-interpreter.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/15-number.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/2-food.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/20-health.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/21-apple.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/22-nut.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/23-holiday.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/25-pasta.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/26-dog.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/27-ship.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/28-spider.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/29-witch.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/3-signlanguage.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/30-pumpkin.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/31-halloween.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/5-who.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/6-deaf.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/10/8-where-.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/11-remember.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/14-peace.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/14-support.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/16-rabbit.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/19-autumn.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/20-fruit.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/21-television.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/21-tv.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/22-exercise.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/24-camera.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/25-meat.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/26-cake.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/27-england.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/27-vegetables.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/28-pastry.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/29-pub.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/30-asthma.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/5-fireworks.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/11/9-hello.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/1-apple.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/10-person.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/11-mountain.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/12-biscuit.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/14-hat.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/15-space%20rocket.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/16-socks.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/18-sheep.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/19-elf.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/2-tie.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/20-santa%20claus.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/22-snow.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/23-stocking.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/24-merry%20christmas.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/25-thank%20you.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/3-deaf.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/31-happy%20new%20year.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/4-cookie.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/5-black.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/6-dark.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/7-sugar.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/8-chocolate.png",
	// 		"https://www.british-sign.co.uk/british-sign-language/sign-of-the-day/2015/12/9-money.png"
	// 		],
	// });
	const sample = await words.getSign();
	if(req.session.user_id!=null){
		res.redirect("dash");
	} else{
		res.render("index", {words: sample});
	}
  	
})
const port = process.env.PORT || 3000
app.listen(port, process.env.IP, function(){
	console.log("App is running.");
})