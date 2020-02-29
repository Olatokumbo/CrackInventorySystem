const express=require("express");
const bodyParser=require("body-parser");
const ejs = require("ejs");
const app = express();
const port =8000;
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));

app.get("/", function(req, res){
    res.render("index");
});
app.listen(port, function(req, res){
    console.log("Listening at port "+port);
});