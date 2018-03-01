var express = require('express');
var router = express.Router();
var api = require('./api.js');

router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/map', function(req, res) {
    res.render('map');
});

router.get('/getList', function(req, res) {
    api.get_center(req.query, function(cenAddr) {
        // api.search_place({
        //     //google API 만료됨!!!
        //     center: cenAddr,
        //     type: req.query.radioValue
        // }, function(place_list) {
        //     if (!place_list || !place_list.length) {
        //         console.log("Not found any places");
        //         res.json(null);
        //     } else {
        //         res.json(place_list);
        //     }
        // });
        console.log(cenAddr);
    });
});

module.exports = router;