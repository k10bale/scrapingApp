var express = require("express");
var request = require("request");
var mongoose = require("mongoose");
var logger = require("morgan");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var PORT = 3000;

// Initialize Express
var app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json({
  type: "application/json"
}));

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));




// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// get all articles from the database that are not saved

var db = require("./models");


app.get("/", function(req, res) {

  db.Articles.find({
      saved: false
    },

    function(error, dbArticle) {
      if (error) {
        console.log(error);
      } else {
        res.render("index", {
          articles: dbArticle
        });
      }
    })
})

  // route for retrieving all the saved articles
app.get("/saved", function(req, res) {
  db.Articles.find({
      saved: true
    })
    .then(function(dbArticle) {
      // if successful, then render with the handlebars saved page
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    })

});

// route for setting an article to saved
app.put("/saved/:id", function(req, res) {
  db.Articles.findByIdAndUpdate(
      req.params.id, {
        $set: req.body
      }, {
        new: true
      })
    .then(function(dbArticle) {
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.nj.com/eagles/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.summary = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
    
        
      db.Articles.create(result)
     .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Articles.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


//get saved articles
app.get("/saved", function(req, res) {
  db.Articles.find({
      saved: true
    })
    .then(function(dbArticle) {
      // if successful, then render with the handlebars saved page
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    })

});

// route for setting an article to saved
app.put("/saved/:id", function(req, res) {
  db.Articles.findByIdAndUpdate(
      req.params.id, {
        $set: req.body
      }, {
        new: true
      })
    .then(function(dbArticle) {
      res.render("saved", {
        articles: dbArticle
      })
    })
    .catch(function(err) {
      res.json(err);
    });
});

// route for saving a new note to the db and associating it with an article
app.post("/submit/:id", function(req, res) {
  db.Comments.create(req.body)
    .then(function(dbComment) {
      var articleIdFromString = mongoose.Types.ObjectId(req.params.id)
      return db.Articles.findByIdAndUpdate(articleIdFromString, {
        $push: {
          comments: dbComment._id
        }
      })
    })
    .then(function(dbArticle) {
      res.json(dbComment);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// route to find a note by ID
app.get("/notes/article/:id", function(req, res) {
  db.Articles.findOne({"_id":req.params.id})
    .populate("comments")
    .exec (function (error, data) {
        if (error) {
            console.log(error);
        } else {
          res.json(data);
        }
    });        
});


app.get("/comments/:id", function(req, res) {

  db.Comments.findOneAndRemove({_id:req.params.id}, function (error, data) {
      if (error) {
          console.log(error);
      } else {
      }
      res.json(data);
  });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
