const express = require('express');
const router = express.Router();
const User = require("../../models/User");

/**
 * @description: 修改密码 api/user/change_pwd/:user_id
 * @param {String} user_id [用户id]
 * @return: 
 */
router.post('/change_pwd/:user_id', (req, res) => {
    if(req.params.user_id == '5e04760686b54f3038190ce5') {
        res.status(404).json({msg: '游客账号不支持修改密码'});
    } else {
        User.findOne({ _id: req.params.user_id }).then(user => {
            if(!user) res.status(404).json(err)
            else {
                user.password = req.body.password;
                user.save()
                res.json({ msg: '修改成功', user})
            }
        }).catch(err => res.status(404).json(err));
    }
})

/**
 * @description: 查询用户信息 api/user/user_info/:user_id
 * @param {String} user_id [用户id]
 * @return: 
 */
router.get('/user_info/:user_id', (req, res) => {
    User.findOne({ _id: req.params.user_id }).then(user => {
        if (user)
            res.json(user);
        else
            res.status(404).json(err)
    }).catch(err => res.status(404).json(err));
})

/**
 * @description: 添加收获地址 api/user/add_address/:user_id
 * @param {String} user_id [用户id]
 * @return: 
 */
router.post('/add_address/:user_id', (req, res) => {
    User.findOne({ _id: req.params.user_id }).then(user => {
        user.myAddress.push(req.body)
        user.save().then(user => res.json(user));
    })
})


/**
 * @description: 编辑收获地址 api/user/edit_address/:user_id/:id [**]POST
 * @param {String} user_id [用户id]
 * @param {String}      id [地址index]
 * @return: 
 */
router.post('/edit_address/:user_id/:id', (req, res) => {
    User.findOne({ _id: req.params.user_id }).then(user => {
        if (user) {
            user.myAddress.forEach(item => {
                if (item._id == req.params.id) {
                    item.name = req.body.name;
                    item.sex = req.body.sex;
                    item.tag = req.body.tag;
                    item.phone = req.body.phone;
                    item.address = req.body.address;
                    item.bottom = req.body.bottom;
                }
            });
        }

        user.save().then(user => res.json(user));
    });
});

/**
 * @description: 删除收获地址 api/user/address/:user_id/:id
 * @param {String} user_id [用户id]
 * @param {String}      id [地址index]
 * @return: 
 */
router.delete('/address/:user_id/:id', (req, res) => {
    User.findOne({ _id: req.params.user_id }).then(user => {
        const removeIndex = user.myAddress.map(item => item._id).indexOf(req.params.id);
        user.myAddress.splice(removeIndex, 1);
        user.save().then(user => res.json(user));
    });
});

module.exports = router;