var mongoose = require("mongoose");

// save a reference to the Schema constructor
var Schema = mongoose.Schema;

// create a new note schema
var CommentSchema = new Schema({
  body: {
    type: String,
    required: true,
    trim: true
      }
  });

// create model
var Comments = mongoose.model("Comments", CommentSchema);

// export the model
module.exports = Comments;