/**
 * Created by tcstory on 1/19/16.
 */
"use strict";

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

var Utils = require('./utils');
var configMap = require('./config.js');
var MongoClient = require('mongodb').MongoClient;

global.io = io;

MongoClient.connect(configMap.mongoDBUrl, function(err, dbInstance) {
    if (!err) {
        console.log("Connected correctly to server");
        global.dbInstance = dbInstance;
        var onlinePeopleCollection = dbInstance.collection('onlinePeople');
        var chatHistoryCollection = dbInstance.collection('chatHistory');

        var session = require('express-session');
        var MongoStore = require('connect-mongo')(session);
        var sessionInstance = session({
            secret: 'tcstory',
            resave: true,
            saveUninitialized: false,
            store: new MongoStore({
                db: dbInstance
            })
        });
        app.use(sessionInstance);

        app.use(express.static(path.join(__dirname, 'site', 'dist')));


        app.get('/', function (req, res) {
            var session = req.session;
            if (session.userId) {
                onlinePeopleCollection.find({'userId': session.userId}).hasNext(function (err, result) {
                    if (!err) {
                        if (!result) {
                            onlinePeopleCollection.insertOne({
                                userId: session.userId,
                                userName: session.userName,
                                userAvatar: session.userAvatar,
                                curRoom: session.curRoom
                            })
                        }
                    } else {
                        throw new Error(err);
                    }
                });
            } else {
                onlinePeopleCollection.find().toArray(function (err, docs) {
                    if (!err) {
                        session.userId = Utils.createIdForVisitor(docs);
                        session.userName = configMap.visitorTextPrompt + session.userId;
                        session.userAvatar = configMap.defaultAvatar;
                        session.curRoom = configMap.defaultRoom;
                        onlinePeopleCollection.insertOne({
                            userId: session.userId,
                            userName: session.userName,
                            userAvatar: session.userAvatar,
                            curRoom: session.curRoom
                        })
                    } else {
                        throw new Error(err);
                    }
                });

            }
            res.sendFile(path.join(__dirname, 'site', 'dist', 'app.html'));
        });


        var userRouter = require('./routers/user.js');
        app.use('/serv/user', userRouter);

        var sharedsession = require("express-socket.io-session");
        io.use(sharedsession(sessionInstance, {
            autoSave: true
        }));
        io.on('connection', function (socket) {
            socket.join(socket.handshake.session.curRoom);
            onlinePeopleCollection.find({curRoom: socket.handshake.session.curRoom}).toArray(function (err, docs) {
                if (!err) {
                    if (docs) {
                        io.to(socket.handshake.session.curRoom).emit('user list', docs);
                    }
                } else {
                    throw new Error(err);
                }
            });
            io.to(socket.handshake.session.curRoom).emit('activities', {
                userName: socket.handshake.session.userName,
                userId: socket.handshake.session.userId,
                action: 'join'
            });

            var projection = {};
            projection[socket.handshake.session.curRoom] = 1;
            projection['_id'] = 0;
            chatHistoryCollection.find({},projection).limit(configMap.defaultPushMessagesNumber).next(function (err, doc) {
                if (doc) {
                    socket.emit('chat messages', doc[socket.handshake.session.curRoom]);
                }
            });
            socket.on('disconnect', function () {
                onlinePeopleCollection.deleteOne({
                    userId: {
                        $eq: socket.handshake.session.userId
                    }
                });
                onlinePeopleCollection.find({curRoom: socket.handshake.session.curRoom}).toArray(function (err, docs) {
                    if (!err) {
                        if (docs) {
                            io.to(session.curRoom).emit('user list', docs);
                        }
                    } else {
                        throw new Error(err);
                    }
                });
                io.to(socket.handshake.session.curRoom).emit('activities', {
                    userName: socket.handshake.session.userName,
                    userAvatar: socket.handshake.session.userAvatar,
                    action: 'leave'
                })
            });
            socket.on('chat message', function (msg) {
                var messageObj = {
                    userId: socket.handshake.session.userId,
                    userAvatar: socket.handshake.session.userAvatar,
                    userName: socket.handshake.session.userName,
                    content: msg,
                    timestamp: Date.now()
                };
                io.to(socket.handshake.session.curRoom).emit('chat messages', messageObj);
                var whereObj = {};
                whereObj[socket.handshake.session.curRoom] = {
                    $exists: true
                };
                var pushObj = {
                    $push: {}
                };
                pushObj['$push'][socket.handshake.session.curRoom] = messageObj;
                chatHistoryCollection.updateOne(whereObj,pushObj);
            });
        });
        server.listen(9999);
    } else {
        throw new Error(err);
    }
});


