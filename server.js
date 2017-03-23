// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();
var PORT = process.env.PORT || 3000;

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));


// Set Handlebars.
// var exphbs = require("express-handlebars");

// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");


// Database configuration with mongoose
// mongoose.connect("mongodb://localhost/newsfeed");
mongoose.connect("mongodb://heroku_v3trs40z:g7evoqhn74bbu71aiqhob6pmg0@ds139630.mlab.com:39360/heroku_v3trs40z");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


//Routes
//===========

//Scrape the hackernews site
app.get("/scrape", function(req, res){
    request("https://news.ycombinator.com/", function(error, response, html)  {
        var $=cheerio.load(html);
        $(".title").each(function(i, element){
            console.log(i);
            var result={};
            result.title = $(this).children("a").text();
            result.link=$(this).children("a").attr("href");

            var entry=new Article(result);

            entry.save(function(err, doc){
                if (err){
                    console.log(err);
                }
                else{
                    console.log(doc);
                }
            });
        });

    });
// Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});


// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});
// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
    console.log(req.body)
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({"_id": req.params.id },{ $push: { "note": doc._id } }, { new: true },
      // Execute the above query
    //   .exec(
          function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});


// This GET route let's us see the notes we have added
app.get("/note", function(req, res) {
  // Using our note model, "find" every note in our article db
  Note.find({}, function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Or send the doc to the browser
    else {
      res.send(doc);
    }
  });
});

// This GET route let's us see the notes we have added
app.delete("/delete/:id", function(req, res) {
  // Using our note model, "find" every note in our article db
  // res.send(req.body);

  // Create a new note and pass the req.body to the entry
  // var newNote = new Note(req.body);

  // // And save the new note the db
  // newNote.save(function(error, doc) {
  //   // Log any errors
  //   if (error) {
  //     console.log(error);
  //   }
  //   // Otherwise
  //   else {()
  //     // Use the article id to find and update it's note
      Note.findByIdAndRemove(req.params.id,
      // Execute the above query
    //   .exec(
          function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          console.log("return delete");
          res.send(doc);
        }
      });
  //   }
  // });
});




// Listen on port 3000
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});
