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
                //global.io.to(req.session.curRoom).emit('activities', {
                //    userName: req.session.userName,
                //    userAvatar: req.session.userAvatar,
                //    action: 'leave'
                //});

                req.session.userName = doc.userName;
                req.session.userId = doc.userId;
                req.session.userAvatar = doc.userAvatar;
                req.session.userIntro = doc.userIntro;
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
                    code: configMap.statusCode.error,
                    msg: {
                        content: '密码错误',
                        title: '错误'
                    }
                })
            }
        } else {
            throw new Error(err);
        }
    });
});

router.post('/sign-up', bodyParser.json(), function (req, res) {
    Utils.cros(res);
    res.set('Content-Type', 'application/json');
    var userName = req.body['user_name'];
    var password = req.body['user_password'];
    global.dbInstance.collection('user').find({
        userName: userName
    }).hasNext(function (err, result) {
        if (!err) {
            if (!result) {
                global.dbInstance.collection('user').find().count(function (err, result) {
                    if (!err) {
                        var userId = configMap.userIdPrefixCharacter + (configMap.userIdStartNumber + result);
                        global.dbInstance.collection('user').insertOne({
                            userName: userName,
                            password: password,
                            userId: userId,
                            userAvatar: configMap.defaultAvatar
                        });
                        var previousPeople = req.session.userId;
                        req.session.userName = userName;
                        req.session.userId = userId;
                        req.session.userAvatar = configMap.defaultAvatar;
                        global.dbInstance.collection('onlinePeople').updateOne({
                            userId: previousPeople
                        }, {
                            $set: {
                                userName: userName,
                                userId: userId,
                                userAvatar: configMap.defaultAvatar
                            }
                        });
                        res.send({
                            code: configMap.statusCode.ok
                        })
                    }
                });
            } else {
                res.send({
                    code: configMap.statusCode.error,
                    msg: {
                        content: '用户名重复',
                        title: '错误'
                    }
                })
            }
        }
    })
});
router.get('/sign-out', function (req, res) {
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
        obj.userIntro = req.session.userIntro;
        var projection = {};
        //projection[req.session.curRoom] = 1;
        projection['_id'] = 0;
        global.dbInstance.collection('room').find({
            roomId: {
                $eq: req.session.curRoom
            }
        }, projection).next(function (err, doc) {
            if (doc) {
                obj.roomLogo = doc.roomLogo;
                obj.roomDescription = doc.roomDescription;
                obj.roomName = doc.roomName;
                res.send(obj);
            }
        });
    }
});

var fs = require('fs');
var path = require('path');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'site/dist/assets/user/')
    },
    filename: function (req, file, cb) {

        req.body.avatarFileName = Date.now() + '.' + file.mimetype.split('/')[1];
        req.body.avatarSuffix = file.mimetype.split('/')[1];
        cb(null, req.body.avatarFileName);
    }
});
var upload = multer({
    storage: storage
});
var storePath = process.cwd() + '/site/dist/assets/user';

router.post('/modify-data', upload.single('userAvatar'), function (req, res) {
    if (req.file) {
        try {
            fs.mkdirSync(path.join(storePath, req.session.userId));
        } catch (e){
            console.log(e);
        }
        fs.writeFileSync(path.join(storePath, req.session.userId, 'avatar.' + req.body.avatarSuffix), fs.readFileSync(path.join(storePath, req.body.avatarFileName)));
        fs.unlinkSync(path.join(storePath, req.body.avatarFileName));
        req.session.userAvatar = 'assets/user/' + req.session.userId + '/avatar.' + req.body.avatarSuffix;
        global.dbInstance.collection('user').updateOne({userId: req.session.userId}, {
            $set: {
                userAvatar: req.session.userAvatar
            }
        });
    }
    global.dbInstance.collection('user').find({userName: req.body.userName}).next(function (err, doc) {
        if (doc) {
            if (doc.userId !== req.session.userId) {
                res.send({
                    code: configMap.statusCode.error,
                    msg: {
                        content: '用户名已经存在',
                        title: '错误'
                    }
                })
            } else {
                global.dbInstance.collection('user').updateOne({userId: req.session.userId}, {
                    $set: {
                        userName: req.body.userName,
                        userIntro: req.body.userIntro
                    }
                });
                req.session.userName = req.body.userName;
                req.session.userIntro = req.body.userIntro;
                res.send({
                    code: configMap.statusCode.ok,
                    msg: {
                        content: '修改成功',
                        title: '报喜'
                    }
                })
            }
        } else {
            global.dbInstance.collection('user').updateOne({userId: req.session.userId}, {
                $set: {
                    userName: req.body.userName,
                    userIntro: req.body.userIntro
                }
            });
            req.session.userName = req.body.userName;
            req.session.userIntro = req.body.userIntro;
            res.send({
                code: configMap.statusCode.ok,
                msg: {
                    content: '修改成功',
                    title: '报喜'
                }
            })
        }
    });
});


router.post('/modify-password', bodyParser.json(), function (req, res) {
    global.dbInstance.collection('user').find({userId: req.session.userId}).next(function (err, doc) {
        if (!err) {
            if (doc.password === req.body.oldPassword) {
                global.dbInstance.collection('user').updateOne({userId: req.session.userId},{
                    $set: {
                        password: req.body.newPassword
                    }
                });
                res.send({
                    code: configMap.statusCode.ok,
                    msg: {
                        content: '密码修改成功',
                        title: '报喜'
                    }
                })
            } else {
                res.send({
                    code: configMap.statusCode.error,
                    msg: {
                        content: '旧密码错误',
                        title: '错误'
                    }
                })
            }
        }
    })
});
router.options('/*?', function (req, res) {
    Utils.cros(res);
    res.send();
});

module.exports = router;