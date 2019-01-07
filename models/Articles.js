var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema ({
    title: {
        type: String,
        required: true 
    },

    summary: {
        type: String,
        required: true
    },

    link: {
        type: String,
        required: true
      },
    saved: {
        type: Boolean,
        default: false
      },
    comments: 
        [{
          type: Schema.Types.ObjectId,
          ref: "Comments"
        }]
      

});

var Articles = mongoose.model("Articles", ArticleSchema);


module.exports = Articles;