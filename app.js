const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");
const passport = require("passport");
const expressSanitizer = require("express-sanitizer");
const LocalStrategy = require("passport-local");
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

const createClient  = require("@astrajs/collections");
const collection = "user"

// create an {astra_db} client
exports.handler = async function (event, context, callback) {
const astraClient =  await createClient({
    astraDatabaseId: process.env.ASTRA_DB_ID,
    astraDatabaseRegion: process.env.ASTRA_DB_REGION,
    applicationToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
});
// const astraClient =  createClient({
//     astraDatabaseId: process.env.ASTRA_DB_ID,
//     astraDatabaseRegion: process.env.ASTRA_DB_REGION,
//     username: process.env.ASTRA_DB_USERNAME,
//     password: process.env.ASTRA_DB_PASSWORD,
//   });

var User =  astraClient
    .namespace(process.env.ASTRA_DB_KEYSPACE)
    .collection(collection);
}
    // app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(
//     function(username, password, done) {
//       User.findOne({ username: username }, function (err, user) {
//         if (err) { return done(err); }
//         if (!user) { return done(null, false); }
//         if (!user.verifyPassword(password)) { return done(null, false); }
//         return done(null, user);
//       });
//     }
//   ));
  
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
// }
app.get("/", function(req, res){
  try {
    console.log("hello");
		const user =  await User.create("Hello",{name: "whatsup"})
    
		return {
		  statusCode: 200,
		  body: JSON.stringify(user),
		};
	  } catch (e) {
		console.error(e);
		return {
		  statusCode: 500,
		  body: JSON.stringify(e),
		}
	}  
  res.send("Hi");
})
app.listen(3000, process.env.IP, function(){
	console.log("App is running.");
})