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
    var obj = {};
    obj.code = 200;
    if (req.session.userId) {
        obj.userId = req.session.userId;
        obj.userAvatar = req.session.userAvatar;
        obj.curRoom = req.session.curRoom;
    } else if (req.session.visitorId) {
        obj.userId = req.session.visitorId;
        obj.userAvatar = req.session.userAvatar;
        obj.curRoom = req.session.curRoom;
    } else {
        //obj.userId = req.session.visitorId;
        //obj.userAvatar = req.session.userAvatar;
        //obj.curRoom = req.session.curRoom;
    }
    res.send(obj);
});


router.options('/*?', function (req, res) {
    Utils.cros(res);
    res.send();
});

module.exports = router;