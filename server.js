'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var cors = require('cors');
var bodyParser = require("body-parser");
var dns = require("dns");

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect("mongodb://fred:fred1234@ds227481.mlab.com:27481/fcc-url-shortener");

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

// model
const Url = mongoose.model("Url", urlSchema);

//check if url is correct

// check if entry exists - .find
// if yes return its short url
// else create entry and return its short url - .create

// data from form: url

app.post("/api/shorturl/new", function(req, res) {
  let original_url = req.body.url;
  let dnsUrl = original_url.match(/www.*/)[0];
  let randomNumber = Math.floor(Math.random() * 1000);
  
  dns.lookup(dnsUrl, function(err, data) {
    if (err) {
      console.log(err);
      res.json({"error": "invalid URL"});
    }
    else {
      Url.findOne({"original_url": original_url}, function(err, data) {
        if (err) console.log(err);
        else {
          if (data === null) {
            Url.create({"original_url": original_url, "short_url": randomNumber}, function(err, data) {
              if (err) console.log(err);
              else {
                res.json({"original_url": data.original_url, "short_url": data.short_url});
              }
            });
          } else {
            res.json({"original_url": data.original_url, "short_url": data.short_url});
          }
        }
      });
    }
  });
});

app.get("/api/shorturl/:short_url", function(req, res) {
  let short_url = req.params.short_url;
  
  Url.findOne({"short_url": short_url}, function(err, data) {
    if (err) console.log(err);
    else {
      if (data === null) {
        res.json({"error": short_url + " not found"});
      } else {
        res.redirect(data.original_url);
      }
    }
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});