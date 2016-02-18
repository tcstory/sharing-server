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

var userList = [];
var visitorList = [];

var configMap = require('./config.js');

app.use(require('cookie-parser')());
var session = require('express-session')({
        secret: 'tcstory',
        resave: true,
        saveUninitialized: false
    }
);
app.use(session);
app.use(express.static(path.join(__dirname, 'site', 'dist')));
app.get('/', function (req, res) {
    if (req.session.userId) {

    } else if (req.session.visitorId) {
        //res.cookie('room', '10001', {
        //    httpOnly: true
        //});
        if (process.env.NODE_ENV === 'development') {
            console.log(visitorList);
        }
    } else {
        req.session.visitorId = Utils.createIdForVisitor(visitorList);
        req.session.userName = req.session.visitorId;
        req.session.userAvatar = configMap.defaultAvatar;
        req.session.curRoom = configMap.defaultRoom;
    }
    res.sendFile(path.join(__dirname, 'site', 'dist', 'app.html'));
});


var userRouter = require('./routers/user.js');
app.use('/serv/user', userRouter);

var sharedsession = require("express-socket.io-session");
io.use(sharedsession(session));
io.on('connection', function(socket){
    socket.join(socket.handshake.session.curRoom);
    socket.emit('user list', Utils.getCurUserList());
    socket.emit('activities', Utils.getActivities());
    socket.emit('chat messages', Utils.getMessages());

    socket.on('disconnect', function(){
    });
    socket.on('chat message', function (msg) {
        io.to(socket.handshake.session.curRoom).emit('chat messages', {
            userId: socket.handshake.session.userId,
            userAvatar: socket.handshake.session.userAvatar,
            userName: socket.handshake.session.userName,
            content: msg
        });
    });
});


server.listen(9999);

