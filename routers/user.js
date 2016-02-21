/**
 * Created by tcstory on 2/16/16.
 */
"use strict";

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var Utils = require('../utils');
var configMap = require('../config.js');



router.post('/sign-in', bodyParser.json(), function (req, res) {
    Utils.cros(res);
    res.set('Content-Type', 'application/json');
    var myCursor = global.dbInstance.collection('user').find({
        userName: req.body['user_name'],
        password: req.body['user_password']
    });
    myCursor.next(function (err, doc) {
        if (!err) {
            if (doc) {
                var previousPeople = req.session.userId;
                global.io.to(req.session.curRoom).emit('activities', {
                    userName: req.session.userName,
                    userAvatar: req.session.userAvatar,
                    action: 'leave'
                });

                req.session.userName = doc.userName;
                req.session.userId = doc.userId;
                req.session.userAvatar = doc.userAvatar;
                global.dbInstance.collection('onlinePeople').updateOne({
                    userId: previousPeople
                }, {
                    $set: {
                        userName: doc.userName,
                        userId: doc.userId,
                        userAvatar: doc.userAvatar
                    }
                });
                res.send({
                    code: configMap.statusCode.ok,
                    userName: doc.userName,
                    userId: doc.userId,
                    userAvatar: doc.userAvatar
                });
            } else {
                res.send({
                    code: configMap.statusCode.error
                })
            }
        } else {
            throw new Error(err);
        }
    });
});

router.get('/sign-out', function (req,res) {
    Utils.cros(res);
    if (req.session.userId.length != 0) {
       global.dbInstance.collection('onlinePeople').deleteOne({
           userId: {
               $eq: req.session.userId
           }
       });
       req.session.destroy();
       res.send({
           code: configMap.statusCode.ok
       })
   }
});

router.get('/basic-info', function (req, res) {
    Utils.cros(res);
    res.set('Content-Type', 'application/json');
    var obj = {};
    obj.code = configMap.statusCode.ok;
    if (req.session.userId) {
        obj.userId = req.session.userId;
        obj.userAvatar = req.session.userAvatar;
        obj.userName = req.session.userName;
    }
    res.send(obj);
});


router.options('/*?', function (req, res) {
    Utils.cros(res);
    res.send();
});

module.exports = router;