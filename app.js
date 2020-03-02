const express=require("express");
const bodyParser=require("body-parser");
const ejs = require("ejs");
// const mongoose = require('mongoose');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' });
var mysql= require('mysql');
const path = require("path");
const app = express();
const port =8000;
let data=0;
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'superFAITH',
    database : 'crackschema'
  });
  connection.connect(function(err) {
    if (err) throw err;
});

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
    res.render("index");    
});

app.get("/home",function(req,res){
    connection.query("SELECT * FROM crackschema.cracktable;", function (err, result) {
        if (err) throw err;
        console.log("Data"+result);
        data=result;
        res.render("home",{data:data});
      });
    
    // res.send("Hello");

});
app.post("/home",upload.any(),function(req, res){
    console.log(req.files[0].filename);
    const files = req.files
    if (!files) {
      const error = new Error('Please choose files')
      error.httpStatusCode = 400
      return next(error)
    }
    let buildingName=req.body.buildingName;
    let location=req.body.location;
    let author=req.body.author;
    let date=req.body.date;
    let recommendation=req.body.recommendation;
    var post={buildingName:buildingName, location:location, author: author, date: date, recommendation:recommendation, image: req.files[0].filename}
    var sql = "INSERT INTO cracktable SET ?";
       connection.query(sql,post, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
      res.redirect("/home");
    });
});
app.post("/delete", function(req, res){
console.log(req.body);
var post={id:req.body.delete}
    var sql = "DELETE FROM cracktable WHERE ?";
       connection.query(sql,post, function (err, result) {
      if (err) throw err;
      console.log("1 record deleted");
      res.redirect("/home");
    });
});
app.get('/cracks/:crackId', function (req, res) {
    var post={id:req.params.crackId}
    var sql = "SELECT * FROM cracktable WHERE ?";
       connection.query(sql,post, function (err, result) {
      if (err) throw err;
      console.log("1 record found");
      res.render("view", {view: result});
    });
  });
app.listen(port, function(req, res){
    console.log("Listening at port "+port);
});