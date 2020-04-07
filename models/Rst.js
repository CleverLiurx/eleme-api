const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RstSchema = new Schema({
	authentic_id: {
		type: String
	},
	data: {
		type: Object
	}
})

module.exports = Rst = mongoose.model("rsts", RstSchema);