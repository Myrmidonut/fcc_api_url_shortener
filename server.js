'use strict';

const express    = require('express');
const mongo      = require('mongodb');
const mongoose   = require('mongoose');
const cors       = require('cors');
const bodyParser = require("body-parser");
const dns        = require("dns");

const app = express();

mongoose.connect(process.env.MLAB_URI);

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("public"));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html')
});

app.get("/api/hello", (req, res) => {
  res.json({greeting: 'hello API'})
});

const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

const Url = mongoose.model("Url", urlSchema);

app.post("/api/shorturl/new", (req, res) => {
  const original_url = req.body.url;
  const dnsUrl = original_url.replace(/^https?:\/\//, "");
  const randomNumber = Math.floor(Math.random() * 1000);
  
  dns.lookup(dnsUrl, (err, data) => {
    if (err) {
      console.log(err);
      res.json({"error": "invalid URL"});
    }
    else {
      Url.findOne({"original_url": original_url}, (err, data) => {
        if (err) console.log(err);
        else {
          if (data === null) {
            Url.create({"original_url": original_url, "short_url": randomNumber}, (err, data) => {
              if (err) console.log(err);
              else {
                res.json({
                  "original_url": data.original_url,
                  "short_url": data.short_url
                });
              }
            });
          } else {
            res.json({
              "original_url": data.original_url,
              "short_url": data.short_url
            });
          }
        }
      });
    }
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const short_url = req.params.short_url;
  
  Url.findOne({"short_url": short_url}, (err, data) => {
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

app.listen(process.env.PORT || 3000, () => console.log('Node.js listening ...'));