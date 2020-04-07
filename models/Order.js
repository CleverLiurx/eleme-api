const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SuccessOrderSchema = new Schema({
    mchid: {
        type: String
    },
    openid: {
        type: String
    },
    out_trade_no: {
        type: String
    },
    payjs_order_id: {
        type: String
    },
    return_code: {
        type: String
    },
    time_end: {
        type: String
    },
    total_fee: {
        type: String
    },
    transaction_id: {
        type: String
    },
    sign: {
        type: String
    }
})

module.exports = SuccessOrder = mongoose.model('SuccessOrder', SuccessOrderSchema)