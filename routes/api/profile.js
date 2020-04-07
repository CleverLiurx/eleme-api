const express = require('express');
const router = express.Router();

const Rst = require("../../models/Rst");
const Shop = require("../../models/Shop");
const Comment = require("../../models/Comment");

// 排序
function sortBy(by) {
    let key = by.key,
        isReverse = by.isReverse;
    return function (a, b) {
        if (a[key] == b[key]) return 0;
        return isReverse ? (Number(a[key]) > Number(b[key]) ? 1 : -1) : (Number(a[key]) < Number(b[key]) ? 1 : -1)
    }
}
/**
 * @description: 商家信息 post api/profile/restaurants/:page/:size, [condition]
 * @param {Number}      page [页数]
 * @param {Number}      size [每页条数]
 * @param {Object} condition [排序规则]
 * @return:
 */
router.post('/restaurants/:page/:size', (req, res) => {
    // res.json(shop);
    let size = req.params.size;
    let page = req.params.page;
    let index = size * (page - 1);
    let newProfiles = [];
    let profiles = [];
    Shop.find({}).then(result => {
        profiles = result;
        if (req.body.condition && req.body.condition != '') {
            if (req.body.condition == 'distance' || req.body.condition == 'float_delivery_fee' || req.body.condition == 'order_lead_time' || req.body.condition == 'float_minimum_order_amount')
                profiles.sort(sortBy({
                    key: req.body.condition,
                    isReverse: true
                }))
            else
                profiles.sort(sortBy({
                    key: req.body.condition,
                    isReverse: false
                }))
        } else if (req.body.code && req.body.code != '') {
            // 过滤
            if (typeof req.body.code == 'string') {
                let newArray = profiles.filter(item => {
                    if (item[req.body.code])
                        return item
                })
                profiles = newArray
            } else {
                let con = req.body.code.MPI.split(',')
                let newArray = profiles.filter(item => {
                    if (item[con[0]])
                        return item
                })
                profiles = newArray
            }
    
        } else {
            profiles = result;
        }
        for (let i = index; i < size * page; i++) {
            if (profiles[i] != null) {
                newProfiles.push(profiles[i]);
            }
        }
        res.json(newProfiles);
    })
});

/**
 * @description: 关键字筛选商家 post api/profile/typeahead/:kw
 * @param {Number} kw [筛选的关键字]
 * @return:
 */
router.get('/typeahead/:kw', (req, res) => {
    let kw = req.params.kw
    var restaurants = []
    var words = []
    Shop.find({}).then(shops => {
        shops.forEach(rst => {
            if (rst.name.indexOf(kw) != -1)
                restaurants.push(rst)
            rst.flavors.forEach(item => {
                if (item.name.indexOf(kw) != -1) 
                    words.push(item.name)
            })
        });
        // 去除重复项
        words = [...new Set(words)];
        res.json({ restaurants, words })
    })

})

/**
 * @description: 指定id商家的商品信息 get api/profile/batch_shop
 * @param {String} authentic_id [真实的商家ID]
 * @return:
 */
router.get('/batch_shop/:authentic_id', (req, res) => {
    Rst.findOne({ authentic_id: req.params.authentic_id }).then(result => {
        if (result) {
            res.json(result.data);
        } else {
            res.status(404).json({msg: '商家正在添加'})
        }
    })
})

/**
 * @description: 获取商品评价信息 get api/profile/comments
 * @param
 * @return:
 */
router.get('/comments/:authentic_id', (req, res) => {
    Comment.findOne({ authentic_id: req.params.authentic_id}).then(com => {
        if (com)
            res.json(com)
        else 
            res.status(404).json({ msg: '没有评论'})
    })
})

/**
 * @description: 获取商家简介 get api/profile/seller
 * @param
 * @return:
 */
router.get('/seller', (req, res) => {
    res.json({ "brand_intros": [{ "brief": "1954年的美国，美食家James W Mclamore和David Edgerton最初的想法很简单，就是将更多美味，高品质，价格合理的汉堡带给每位顾客，他们想要将火焰烧烤的精华灌注于每一个汉堡中。\n汉堡王主张“真正火烤”的美味享受，精心选用100%纯牛肉饼，在超过300度高温设备上翻烤，快速锁住肉质的汁水，去除多余油腻，散发一种独特的香味，使得每片牛肉饼上都留下一条条独特火烤烤纹烙印。\n明星皇堡诞生于1957年，使用100%牛肉，经过高温火烤，肉质紧实，鲜嫩多汁，加入番茄，酸黄瓜等蔬菜，口感丰富更添美味爽口。8种原料层层叠加，分量十足。作为汉堡王标志性产品，它每年销量超过2.1亿个。", "image_hash": "https://fuss10.elemecdn.com/6/86/9b4a88cbf2d93d90be2baa8fdaf64png.png" }], "header_image": "https://fuss10.elemecdn.com/6/86/9b4a88cbf2d93d90be2baa8fdaf64png.png", "title": "真正火烤，始于1954" });
})
/**
 * @description: 热门搜索 get api/profile/hotwords
 * @param
 * @return:
 */
router.get('/hotwords', (req, res) => {
    res.json({"hot_words":['炸鸡', '黄焖鸡米饭排骨米饭', '天瑞福云南过桥米饭', '赫鲜生鲍汁鸡', 'coco', '米线', '米线', '麦肯基炸鸡汉堡', '英雄联盟', 'Liurx']});
})

/**
 * @description: 首页轮播数据 api/profile/shopping
 * @param
 * @return: 
 */
router.get('/front_page_imgs', (req, res) => {
    res.json({
        swipeImgs: [
            "https://s2.ax1x.com/2019/12/29/luXjO0.jpg",
            "https://s2.ax1x.com/2019/12/29/luXOln.jpg",
            "https://s2.ax1x.com/2019/12/29/luXbWj.jpg",
            "https://s2.ax1x.com/2019/12/29/luXHYQ.jpg"
        ],
        entries: [
            {
                name: "美食",
                image: "https://s2.ax1x.com/2019/12/29/ln4pAx.png"
            },
            {
                name: "商超便利",
                image: "https://s2.ax1x.com/2019/12/29/ln4i9O.png"
            },
            {
                name: "水果",
                image: "https://s2.ax1x.com/2019/12/29/ln49N6.png"
            },
            {
                name: "跑腿代购",
                image: "https://s2.ax1x.com/2019/12/29/ln4C4K.png"
            },
            {
                name: "甜品饮品",
                image: "https://s2.ax1x.com/2019/12/29/lnhzH1.png"
            }
        ],
        classify: [
            {
                name: "晚餐",
                image: "https://s2.ax1x.com/2019/12/29/luvUDx.png"
            },
            {
                name: "汉堡披萨",
                image: "https://s2.ax1x.com/2019/12/29/luvwVK.png"
            },
            {
                name: "素食简餐",
                image: "https://s2.ax1x.com/2019/12/29/luvab6.png"
            },
            {
                name: "炸鸡炸串",
                image: "https://s2.ax1x.com/2019/12/29/luvNK1.png"
            },
            {
                name: "买菜",
                image: "https://s2.ax1x.com/2019/12/29/luv0UO.png"
            },
            {
                name: "星选好店",
                image: "https://s2.ax1x.com/2019/12/29/luxsoT.png"
            },
            {
                name: "大牌惠吃",
                image: "https://s2.ax1x.com/2019/12/29/luxWl9.png"
            },
            {
                name: "签到赢饭钱",
                image: "https://s2.ax1x.com/2019/12/29/luxcYF.png"
            },
            {
                name: "送药上门",
                image: "https://s2.ax1x.com/2019/12/29/luxgW4.png"
            },
            {
                name: "全部分类",
                image: "https://s2.ax1x.com/2019/12/29/lux6FU.png"
            }
        ]
    })
});

/**
 * @description: 筛选 api/profile/filter
 * @param
 * @return: 
 */
router.get('/filter', (req, res) => {
    res.json({
        navTab: [
            // 过滤按钮
            {
                name: "综合排序",
                icon: "caret-down"
            },
            {
                name: "距离最近",
                condition: 'distance'
            },
            {
                name: "品质联盟",
                condition: 'is_premium'
            },
            {
                name: "筛选",
                icon: "filter"
            }
        ],
        sortBy: [
            // 综合排序
            {
                name: "综合排序",
                check: false,
                code: ''
            },
            {
                name: "好评优先",
                check: false,
                code: 'rating'
            },
            {
                name: "销量最高",
                check: false,
                code: 'recent_order_num'
            },
            {
                name: "起送价最低",
                check: false,
                code: 'float_minimum_order_amount'
            },
            {
                name: "配送最快",
                check: false,
                code: 'order_lead_time'
            },
            {
                name: "配送费最低",
                check: false,
                code: 'float_delivery_fee'
            },
            {
                name: "人均从低到高",
                check: false,
                code: ''
            },
            {
                name: "人均从高到低",
                check: false,
                code: ''
            },
            {
                name: "通用排序",
                check: false,
                code: ''
            }
        ],
        screenBy: [
            // 筛选
            {
                title: "商家服务（可多选）",
                id: 'MPI',
                data: [{
                        name: "蜂鸟专送",
                        icon: "https://fuss10.elemecdn.com/b/9b/45d2f6ff0dbeef3a78ef0e4e90abapng.png",
                        select: false,
                        code: 'delivery_mode'
                    },
                    {
                        name: "品牌商家",
                        icon: "https://fuss10.elemecdn.com/6/7c/417ba499b9ef8240b8014a453bf30png.png",
                        select: false,
                        code: 'is_premium'
                    },
                    {
                        name: "新店",
                        icon: "https://fuss10.elemecdn.com/c/93/ded991df780906f7471128a226104png.png",
                        select: false,
                        code: ''
                    },
                    {
                        name: "食安保",
                        icon: "https://fuss10.elemecdn.com/2/cd/444d002a94325c5dff004fb3b9505png.png",
                        select: false,
                        code: ''
                    },
                    {
                        name: "开发票",
                        icon: "https://fuss10.elemecdn.com/3/d4/5668ffc03151826f95b75249bea31png.png",
                        select: false,
                        code: ''
                    }
                ]
            },
            {
                title: "优惠活动（单选）",
                id: 'offer',
                data: [{
                        name: "首单立减",
                        select: false,
                        code: ''
                    },
                    {
                        name: "门店新客立减",
                        select: false,
                        code: ''
                    },
                    {
                        name: "满减优惠",
                        select: false,
                        code: ''
                    },
                    {
                        name: "下单返红包",
                        select: false,
                        code: ''
                    },
                    {
                        name: "进店领红包",
                        select: false,
                        code: ''
                    },
                    {
                        name: "配送费优惠",
                        select: false,
                        code: ''
                    },
                    {
                        name: "赠品优惠",
                        select: false,
                        code: ''
                    },
                    {
                        name: "特价商品",
                        select: false,
                        code: ''
                    },
                    {
                        name: "品质联盟红包",
                        select: false,
                        code: ''
                    }
                ]
            },
            {
                title: "人均消费",
                id: 'per',
                data: [{
                        name: "¥20以下",
                        select: false,
                        code: ''
                    },
                    {
                        name: "¥20-¥40",
                        select: false,
                        code: ''
                    },
                    {
                        name: "¥40-¥60",
                        select: false,
                        code: ''
                    },
                    {
                        name: "¥60-¥80",
                        select: false,
                        code: ''
                    },
                    {
                        name: "¥80-¥100",
                        select: false,
                        code: ''
                    },
                    {
                        name: "¥100以上",
                        select: false,
                        code: ''
                    }
                ]
            }
        ]
    })
})

module.exports = router;