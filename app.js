/**
 * Created by tcstory on 1/19/16.
 */
"use strict";

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


var Utils = require('./utils');
app.post('/sign-in', function (req, res) {
    Utils.cros(res);
    res.set('Content-Type', 'application/json');
    res.send({
        code: 200,
        userName: '中华田园犬',
        userId: 10001,
        userAvatar: 'http://7qn8rp.com1.z0.glb.clouddn.com/dog.jpg'
    });
});

app.get('/serv/basic-info', function (req, res) {
    Utils.cros(res);
    res.set('Content-Type', 'application/json');
    res.send({
        code: 200,
        userList: Utils.getCurUserList(),
        activities:Utils.getActivities()
    })
});


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

app.options('*', function (req, res) {
    Utils.cros(res);
    res.send();
});

server.listen(9999);

