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
app.use(require('express-session')({
        secret: 'tcstory',
        resave: true,
        saveUninitialized: false
    }
));
app.use(express.static(path.join(__dirname, 'site', 'dist')));
app.get('/', function (req, res) {
    if (req.session.userId) {

    } else if (req.session.visitorId) {
        //res.cookie('room', '10001', {
        //    httpOnly: true
        //});
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


io.on('connection', function(socket){
    console.log('a user connect');
    socket.emit('user list', Utils.getCurUserList());
    socket.emit('activities', Utils.getActivities());
    socket.emit('chat messages', Utils.getMessages());

    socket.on('disconnect', function(){
    });
    socket.on('chat message', function (msg) {
        socket.emit('chat messages', {
            userId: '',
            userAvatar: '',
            userName: '中华田园犬',
            content: msg
        });
    });
});


server.listen(9999);

