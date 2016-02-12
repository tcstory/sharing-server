/**
 * Created by tcstory on 1/19/16.
 */
"use strict";

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.post('/sign-in', function (req, res) {
    cros(res);
    res.set('Content-Type', 'application/json');
    res.send({
        code: 200,
        userName: '中华田园犬',
        userId: 10001,
        userAvatar: 'http://7qn8rp.com1.z0.glb.clouddn.com/dog.jpg'
    });
});

app.get('/serv/basic-info', function (req, res) {
    cros(res);
    res.set('Content-Type', 'application/json');
    res.send({
        code: 200,
        userList: [
            {
                userName: '爱情来过',
                userId: 10000,
                userAvatar: 'http://7qn8rp.com1.z0.glb.clouddn.com/dog.jpg'
            }, {
                userName: '中华田园犬',
                userId: 10001,
                userAvatar: 'http://7qn8rp.com1.z0.glb.clouddn.com/dog.jpg'
            }, {
                userName: '大兄弟',
                userId: 10002,
                userAvatar: 'http://7qn8rp.com1.z0.glb.clouddn.com/dog.jpg'
            }
        ],
        activities: [
            {
                userName: '中华田园犬',
                userId: 10001,
                action: 'join'
            },
            {
                userName: '大兄弟',
                userId: 10002,
                action: 'leave'
            }
        ]

    })
});


io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
    socket.on('chat message', function (msg) {
        console.log(msg);
    })
});

app.options('*', function (req, res) {
    cros(res);
    res.send();
});

server.listen(9999);


function cros(res) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
}
function socketioCros(res) {
    res.set('Access-Control-Allow-Origin', 'http://localhost:63300');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
}