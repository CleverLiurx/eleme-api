const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserOrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    orderlist: [
        {
            orderInfo: {
                type: Object
            },
            userInfo: {
                type: Object
            },
            remarkInfo: {
                type: Object
            },
            date: {
                type: Date,
                default: Date.now
            },
            nowAddrInfo: {
                type: Object
            },
            isSuccess: {
                type: Boolean,
                default: false
            }
        }
    ]
})

module.exports = UserOrder = mongoose.model("userorder", UserOrderSchema);