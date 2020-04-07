const express = require('express');
const router = express.Router();
const request = require('request');
const Login = require("../../models/Login");
const User = require("../../models/User");
const keys = require("../../config/keys");

/**
 * @description: 发送验证码 api/login/sms_send [**]POST
 * @param {String}        to [手机号]
 * @param {String}     appid [短信模板ID]
 * @param {String} signature [APIKEY]
 * @param {String}   content [短信内容]
 * @return: 
 */
router.post('/sms_send', (req, res) => {
	let code = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
	let unixTime = Math.round(new Date().getTime()/1000);

	const forms = {
		appid: req.body.SMS_ID,
		to: req.body.mobile,
		content: `【Liurx】您的验证码是：${code}，五分钟内有效，如非本人操作请忽略。`,
		signature: req.body.SMS_KEY
	};

	request.post({url: keys.SMS_API_URL, form: forms}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var jsonObj = JSON.parse(body);
			res.json(jsonObj);
			Login.findOne({ mobile: req.body.mobile }).then(result => {
				if (!result) {
					new Login({
						mobile: req.body.mobile,
						code: code,
						time: unixTime
					}).save()
				}else{
					result.code = code,
					result.time = unixTime
					result.save()
				}
			})
		}else{
			console.log('请求异常');
			res.json(error);
		}
	});
})

/**
 * @description: 登录 api/login/sms_back
 * @param {String} mobile [手机号]
 * @param {String}   code [验证码]
 * @param {Number}   type [0-验证码登录 1-密码登录]
 * @return: 
 */
router.post('/sms_back', (req, res) => {
    if(!req.body.type){
        // 验证码登录
        Login.findOne({ mobile: req.body.mobile }).then(result => {
            if (result) {
                if (result.code == req.body.code) {
                    const nowUnixTime = Math.round(new Date().getTime()/1000);
                    if(nowUnixTime - result.time <= 180){
                        User.findOne({ mobile: req.body.mobile }).then(user => {
                        if (!user)
                            new User({
                                mobile: req.body.mobile
                            }).save().then(user => res.json({ msg: '验证成功', user }));
                        else
                            res.json({ msg: '验证成功', user })
                        })
                    }else{
                        res.status(404).json({ msg: '验证码超时，请重新获取' })
                    }
                }else{
                    res.status(404).json({ msg: '验证码有误' })
                }
            }
        })
    }else{
        // 密码登录
        User.findOne({ mobile: req.body.mobile }).then(user => {
            if(!user){
                res.status(404).json({ msg: '此手机号未注册' });
            }else{
                if(user.password != req.body.code){
                    res.status(404).json({ msg: '密码错误' });
                }else{
                    res.json({ msg: '验证成功', user })
                }
            }
        })
    }
})

module.exports = router;
