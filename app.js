/**
 * Created by tcstory on 1/19/16.
 */
"use strict";

var express = require('express');

var app = express();

app.post('/sign-in', function (req, res) {
    cros(res);
    res.set('Content-Type', 'application/json');
    res.send({
        code: 200,
        userName: '中华田园犬',
        userAvatar: 'http://7qn8rp.com1.z0.glb.clouddn.com/dog.jpg'
    });
});

app.options('*', function (req,res) {
    cros(res);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.send();
});

app.listen(9999);



function cros(res) {
    res.set('Access-Control-Allow-Origin', '*');
}