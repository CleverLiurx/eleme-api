const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
	authentic_id: {
        type: Number,
        require: true
    },
	comments: Array,
	rating: Object,
	tags: Array
})

module.exports = Comment = mongoose.model("comments", CommentSchema);