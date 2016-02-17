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
var UtilsDebug = require('./utils-debug');
var debugging = UtilsDebug.debugging;

var userList = [];
var visitorList = [];

app.use(require('cookie-parser')());
app.use(require('express-session')({
        secret: 'tcstory',
        resave: true,
        saveUninitialized: false
    }
));
app.use(express.static(path.join(__dirname, 'site', 'dist')));
app.get('/', function (req, res) {
    debugging(function () {
        console.log(req.session.userId);
    });
    if (req.cookies.room) {
    } else {
        res.cookie('room', '10001', {
            httpOnly: true
        });
        req.session.userId = Utils.createIdForVisitor(visitorList);
        debugging(function () {
            console.log(visitorList);
        });
    }
    res.sendFile(path.join(__dirname, 'site', 'dist', 'app.html'));
});


var userRouter = require('./routers/user.js');
app.use('/serv/user', userRouter);


io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('chat message', function (msg) {
        socket.emit('chat messages', {
            userId: '',
            userAvatar: '',
            userName: '中华田园犬',
            content: msg
        });
    });
    socket.emit('user list', Utils.getCurUserList());
    socket.emit('activities', Utils.getActivities());
    socket.emit('chat messages', Utils.getMessages());
});


server.listen(9999);

