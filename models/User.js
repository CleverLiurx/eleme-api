const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    myAddress: [
        {
            name: {
                type: String
            },
            sex: {
                type: String
            },
            phone: {
                type: String
            },
            address: {
                type: String
            },
            bottom: {
                type: String
            },
            tag: {
                type: String
            }
        }
    ]
})

module.exports = User = mongoose.model("user", UserSchema);