const express = require('express');
const router = express.Router();

const keys = require("../../config/keys");

const querystring = require('querystring');
const urlencode = require('urlencode');
const utility=require("utility");
const request = require('request');

const Order = require("../../models/Order");
const UserOrder = require("../../models/UserOrder");


function getSign(data) {
    let queryData = urlencode.decode(querystring.stringify(data));
    let md5Data = utility.md5(queryData);
    const uperCaseData = md5Data.toUpperCase();
    return uperCaseData;
}
/**
 * @description: 获取二维码 扫码支付 api/order/wx_qecode_pay [*POST*]
 * @param {String}    total_fee [支付金额]
 * @param {String} out_trade_no [前端的订单编号]
 * @return: 
 */
router.post('/wx_qrcode_pay', (req, res) => {
    const data = {
        mchid: '1568951701',
        notify_url: 'http://60.205.185.94:3000/api/order/wx_pay_callback',
        out_trade_no: req.body.out_trade_no,
        total_fee: parseInt(req.body.total_fee),
        key: 'BXHciV118NgIXCfF'
    };
    const signs = getSign(data);

	const forms = {
		mchid: '1568951701',
        notify_url: 'http://60.205.185.94:3000/api/order/wx_pay_callback',
        out_trade_no: req.body.out_trade_no,
        total_fee: parseInt(req.body.total_fee),
        sign: signs
	};
	request.post({url: keys.ORDER_PAY + '/native', form: forms}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var jsonObj = JSON.parse(body);
			res.json(jsonObj);
		}else{
			// console.log('请求异常');
			res.json(error);
		}
	});
})


/**
 * @description: 微信API支付 api/order/wx_api_pay [*POST*]
 * @param {String}    total_fee [支付金额]
 * @param {String} out_trade_no [前端的订单编号]
 * @param {String}       openid [openid:oDzVg5sSDNr5QyIT5HKHKmkJpy2E]
 * @return: 
 */
router.post('/wx_api_pay', (req, res) => {
    // 生成签名
    const data = {
        mchid: '1568951701',
        notify_url: 'http://60.205.185.94:3000/api/order/wx_pay_callback',
        openid: req.body.openid,
        out_trade_no: req.body.out_trade_no,
        total_fee: parseInt(req.body.total_fee),
        key: 'BXHciV118NgIXCfF'
    }
    const signs = getSign(data);
    // 要发送的数据
    const forms = {
        mchid: '1568951701',
        notify_url: 'http://60.205.185.94:3000/api/order/wx_pay_callback',
        openid: req.body.openid,
        out_trade_no: req.body.out_trade_no,
        total_fee: parseInt(req.body.total_fee),
        sign: signs
    }
    // 发送请求
    request.post({url: keys.ORDER_PAY + '/jsapi', form: forms}, (error, response, body) => {
        if (!error && response.statusCode == 200) {
			var jsonObj = JSON.parse(body);
			res.json(jsonObj);
		}else{
			// console.log('请求异常');
			res.json(error);
		}
    })
})
/**
 * @description: 支付成功 异步回调（微信官方发送） api/order/wx_pay_callback [*POST*]
 * @return: {status: 200} || {status: 500}
 */
router.post('/wx_pay_callback', (req, res) => {
    Order.findOne({ payjs_order_id: req.body.payjs_order_id}).then(result => {
        if (!result) {
            new Order({
                mchid: req.body.mchid,
                openid: req.body.openid,
                out_trade_no: req.body.out_trade_no,
                payjs_order_id: req.body.payjs_order_id,
                return_code: req.body.return_code,
                time_end: req.body.time_end,
                total_fee: req.body.payjs_order_id,
                transaction_id: req.body.transaction_id,
                sign: req.body.sign,
                attach: req.body.attach
            }).save().then(order => {
                res.send('success');
            }).catch(err => {
                res.status(500).json({return_msg: 'FAIL'});
            })
        } else {
            res.send('success');
        }
    })
})

/**
 * @description: 查询订单是否支付成功 api/order/pay_status/payjs_order_id [*POST*]
 * @param {String}    payjs_order_id [订单编号]
 * @return: { msg: '付款成功', code: 1 } || { msg: '付款失败', code: 2 }
 */
router.post('/pay_status/:payjs_order_id', (req, res) => {
    Order.findOne({ payjs_order_id: req.params.payjs_order_id }).then(result => {
        if (!result) {
            // 失败 或 未返回
            res.json({ msg: '微信服务器暂未返回支付结果', code: 3 })
        } else {
            if(result.return_code == 1) {
                res.json({ msg: '付款成功', code: 1 })
            }else {
                res.json({ msg: '付款失败', code: 2 })
            }
        }
    })
})

/**
 * @description: 添加订单 api/order/add_order/user_id [*POST*]
 * @param {String}      user_id [用户id]
 * @param {String}    orderlist [订单详情]
 * @return: {user:2d8asdas0f9as0f9, orderlist:.....} || {status: 404}
 */
router.post('/add_order/:user_id', (req, res) => {
    UserOrder.findOne({ user: req.params.user_id }).then(order => {
        if (order) {
            order.orderlist.push(req.body)
            order.save().then(order => res.json(order));
        } else {
            let orderlist = []
            orderlist.push(req.body)
            new UserOrder({
                user: req.params.user_id,
                orderlist: orderlist
            }).save().then(order => res.json(order));
        }
    }).catch(err => res.status(404).json(err));
})

/**
 * @description: 查询订单 api/order/search_order/user_id [*GET*]
 * @param {String}     user_id [用户id]
 * @return: {user:2d8asdas0f9as0f9, orderlist:.....} || {status: 404}
 */
router.get('/search_order/:user_id', (req, res) => {
    UserOrder.findOne({ user: req.params.user_id }).then(order => {
        res.json(order)
    }).catch(err => res.status(404).json(err));
})
/**
 * @description: 关闭订单 api/order/close_order/payjs_order_id [*POST*]
 * @param {String} payjs_order_id [后台订单id]
 * @return: {return_code: 1}
 */
router.get('/close_order/:payjs_order_id', (req, res) => {
    const data = {
        payjs_order_id: req.params.payjs_order_id,
        key: 'BXHciV118NgIXCfF'
    };
    const signs = getSign(data);
    const forms = {
        payjs_order_id: req.params.payjs_order_id,
        sign: signs
    };
    request.post({url: keys.ORDER_PAY + '/close', form: forms}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var jsonObj = JSON.parse(body);
			res.json(jsonObj);
		}else{
			res.json(error);
		}
	});
})
/**
 * @description: 删除订单 api/order/delete_order/order_id/order_id [*GET*]
 * @param {String}  user_id [用户id]
 * @param {String} order_id [单订单id]
 * @return: {return_code: 1} || {status: 404}
 */
router.delete('/delete_order/:user_id/:order_id', (req, res) => {
    UserOrder.findOne({ user: req.params.user_id }).then(order => {
        if(order){     
            order.orderlist = order.orderlist.filter(_ => {
                return _._id != req.params.order_id;
            })
            order.save().then(order => {
                res.json(order);
            })
        }
    }).catch(err => {
        res.status(404).json(err);
    })
})


module.exports = router;
