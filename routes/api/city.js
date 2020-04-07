const express = require('express');
const extend = require('extend');
const City = require("../../models/City");
const app = express();

/**
 * @description: 获取城市列表 api/city
 * @return:
 */
const cityList = app.get('/', (req, res) => {
    City.find({}).then(result => {
        var cities = {};
        result.forEach(city => {
            cities = extend(true, {}, cities, city);
        });
        res.json(cities);
    })
})

module.exports = cityList;