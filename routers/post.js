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
                    callback();
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

router.get('/get-post-details', function (req, res) {
    var postId = req.query.postId;
    global.dbInstance.collection('posts').find({
        roomId: req.session.curRoom
    }).next(function (err, doc) {
        if (!err) {
            var posts = doc.posts;
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].postId == postId) {
                    if (posts[i].replay.length !== 0) {
                        (function (i) {
                            async.each(posts[i].replay, function (item, callback) {
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
                                global.dbInstance.collection('user').find({
                                    userId: posts[i].authorId
                                }).next(function (err, doc) {
                                    if (!err) {
                                        posts[i].authorAvatar = doc.userAvatar;
                                        res.send({
                                            code: configMap.statusCode.ok,
                                            post: posts[i]
                                        })
                                    }
                                });
                            });
                        })(i);
                    } else {
                        (function (i) {
                            global.dbInstance.collection('user').find({
                                userId: posts[i].authorId
                            }).next(function (err, doc) {
                                if (!err) {
                                    posts[i].authorAvatar = doc.userAvatar;
                                    res.send({
                                        code: configMap.statusCode.ok,
                                        post: posts[i]
                                    })
                                }
                            });
                        })(i)
                    }
                    break;
                }
            }
        }
    })
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
                        postId: configMap.postStartNumber + doc.posts.length + '',
                        postTime: Date.now(),
                        replay: []
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
router.post('/replay-post', bodyParser.json(), function (req, res) {
    global.dbInstance.collection('posts').find({
        roomId: req.session.curRoom
    }, {
        _id: false,
        roomId: false
    }).next(function (err, doc) {
        if (!err) {
            if (doc) {
                var posts = doc.posts;
                var index = -1;
                for (var i = 0; i < posts.length; i++) {
                    if (posts[i].postId == req.body.postId) {
                        index = i;
                        break;
                    }
                }
                var obj = {};
                obj['posts.' + i + '.replay'] = {
                    userId: req.session.userId,
                    content: req.body.content,
                    replayTime: Date.now()
                };
                global.dbInstance.collection('posts').updateOne({
                    roomId: req.session.curRoom
                }, {
                    $push: obj
                });
                res.send({
                    code: configMap.statusCode.ok
                });
            }
        }
    })
});


module.exports = router;

