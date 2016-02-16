/**
 * Created by tcstory on 2/16/16.
 */
"use strict";

var express = require('express');
var router = express.Router();

var Utils = require('../utils');


router.post('/sign-in', function (req, res) {
    Utils.cros(res);
    res.set('Content-Type', 'application/json');
    res.send({
        code: 200,
        userName: '中华田园犬',
        userId: 10001,
        userAvatar: 'http://7qn8rp.com1.z0.glb.clouddn.com/dog.jpg'
    });
});

router.get('/basic-info', function (req, res) {
    Utils.cros(res);
    res.set('Content-Type', 'application/json');
    res.send({
        code: 200,
        userList: Utils.getCurUserList(),
        activities:Utils.getActivities()
    })
});


router.options('/*?', function (req, res) {
    Utils.cros(res);
    res.send();
});

module.exports = router;