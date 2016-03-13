/**
 * Created by tcstory on 16-3-13.
 */
var express = require('express');
var router = express.Router();
var async = require('async');
var bodyParser = require('body-parser');


var configMap = require('../config.js');


router.get('/get-post-list', function (req, res) {
    async.series([function (callback) {
        console.time('db');
        global.dbInstance.collection('posts').find({
            roomId: req.session.curRoom
        }, {_id: false}).next(function (err, doc) {
            if (!err) {
                callback(null, doc.posts);
            }
        })
    }], function (callback, results) {
        async.each(results[0], function (item, callback) {
            global.dbInstance.collection('user').find({
                userId: item.authorId
            }).next(function (err, doc) {
                if (!err) {
                    item.authorAvatar = doc.userAvatar;
                    item.authorName = doc.userName;
                    async.each(item.replay, function (item, callback) {
                        global.dbInstance.collection('user').find({
                            userId: item.userId
                        }).next(function (err, doc) {
                            if (!err) {
                                item.userAvatar = doc.userAvatar;
                                item.userName = doc.userName;
                                callback()
                            }
                        })

                    }, function () {
                        callback();
                    });
                }
            });
        }, function (err) {
            if (!err) {
                res.send({
                    code: configMap.statusCode.ok,
                    posts: results[0]
                });
                console.timeEnd('db');
            }
        })
    });
});

router.post('/create-post', bodyParser.json(), function (req, res) {
    global.dbInstance.collection('posts').find({roomId: req.session.curRoom}).next(function (err, doc) {
        if (!err) {
            global.dbInstance.collection('posts').updateOne({
                roomId: req.session.curRoom
            }, {
                $push: {
                    posts: {
                        postTitle: req.body['title'],
                        content: req.body['content'],
                        authorId: req.session.userId,
                        postId: configMap.postStartNumber + doc.posts.length,
                        postTime: Date.now()
                    }
                }
            }, function (err, result) {
                if (!err) {
                    res.send({
                        code: configMap.statusCode.ok,
                        msg: {
                            content: '发帖成功',
                            title: '报喜'
                        }
                    })
                }
            });
        }
    });

});


module.exports = router;

