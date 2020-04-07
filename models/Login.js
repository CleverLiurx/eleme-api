const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const LoginSchema = new Schema({
    mobile: {
        type: String,
        required: true
    },
    code: {
        type: String
    },
    time: {
        type: String
    }
})

module.exports = Login = mongoose.model("login", LoginSchema);