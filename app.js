const express=require("express");
const bodyParser=require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' });
const path = require("path");
var session = require('express-session');
const fs =require("fs");
const app = express();
const port =8000;
let data=0;
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
mongoose.connect('mongodb://localhost:27017/CrackInventoryDB', {useNewUrlParser: true, useUnifiedTopology: true});
const crackSchema = new mongoose.Schema({
    buildingName:  String, // String is shorthand for {type: String}
    location: String,
    image:   String,
    author: String,
    date: String,
    recommendation: String
});
const userSchema = new mongoose.Schema({
  username:  String, // String is shorthand for {type: String}
  password: String,
});
const Crack = mongoose.model("crack", crackSchema);
const User = mongoose.model("user", userSchema);
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+'.jpg')
    }
  })
   
  var upload = multer({ storage: storage });

app.get("/", function(req, res){
   if (req.session.loggedin) res.redirect("/home");
   else
    res.render("index");    
});

app.get("/home",function(req,res){
  if (req.session.loggedin) {
    Crack.find({}, function(err, docs) {
      if (!err){ 
          console.log(docs.length);
          data=docs;
          res.render("home", {data:docs});
          // process.exit();
      } else {throw err;}
  });
	} else {
		res.redirect('/');
	}
});
// 
app.post('/auth', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	if (username && password) {
  User.find({username: username, password: password}, function(err, results) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				res.redirect('/home');
			} else {
				res.redirect("/");
			}			
			// res.end();
		});
	} else {
    res.redirect("/");
	}
});

//
app.post("/logout", function(req, res){
  req.session.destroy(function(err){  
    if(err){  
        console.log(err);  
    }  
    else  
    {  
        res.redirect('/');  
    }  
});
});
//



app.post("/home",upload.any(),function(req, res){
    console.log("File "+req.files[0].filename);
    const files = req.files
    if (!files) {
      const error = new Error('Please choose files')
      error.httpStatusCode = 400
      return next(error)
    }
        const crackAnalysis = new Crack({
        buildingName:  req.body.buildingName, 
        location: req.body.location,
        image:   req.files[0].filename,
        author: req.body.author,
        date: req.body.date,
        recommendation: req.body.recommendation
        });
        crackAnalysis.save(function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Data was sucessfully stored in the database");
                res.redirect("/home");
            }
        });
});
app.post("/delete", function(req, res){
  Crack.findById(req.body.delete, function(err, results){
    if (!err) {
      console.log("Deleted: "+ results); 
      fs.unlink("./public/uploads/"+results.image, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File deleted!');
        Crack.findByIdAndDelete(req.body.delete, function(err){
          if(!err){
            res.redirect("/home");
          }
          else
          console.log(err)
        });
    });                                 
      console.log("1 record deleted");
      // res.redirect("/home");
}
else {
  console.log(err);
}
  });
});

  app.get('/cracks/:crackId', function (req, res) {
    console.log("The View");
    Crack.findOne({_id: req.params.crackId}, function(err, result){
      if (!err) {
        console.log(result);
        res.render("view", {view: result});
   }
   else {
    console.log(err);
    console.log("Not found");
   }
    });
  });

  ///////////////
// console.log(req.body);
app.listen(port, function(req, res){
    console.log("Listening at port "+port);
});