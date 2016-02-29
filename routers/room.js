/**
 * Created by tcstory on 2/27/16.
 */

var express = require('express');
var router = express.Router();
var multer = require('multer');

var path = require('path');
var fs = require('fs');
var configMap = require('../config.js');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'site/dist/assets/room/')
    },
    filename: function (req, file, cb) {

        req.body.logoFileName = Date.now() + '.' + file.mimetype.split('/')[1];
        req.body.logoSuffix = file.mimetype.split('/')[1];
        cb(null, req.body.logoFileName);
    }
});
var upload = multer({
    storage: storage
});


var storePath = process.cwd() + '/site/dist/assets/room';
router.post('/create-room', upload.single('roomLogo'), function (req, res) {
    global.dbInstance.collection('room').find({
        roomName: req.body.roomName
    }).hasNext(function (err, doc) {
        if (!err) {
            if (!doc) {
                global.dbInstance.collection('room').find().count(function (err, result) {
                    if (!err) {
                        var roomId = configMap.roomIdPrefixCharacter + (configMap.roomIdStartNumber + result);
                        fs.mkdirSync(path.join(storePath, roomId));
                        fs.writeFileSync(path.join(storePath, roomId, 'logo.' + req.body.logoSuffix), fs.readFileSync(path.join(storePath, req.body.logoFileName)));
                        fs.unlinkSync(path.join(storePath, req.body.logoFileName));
                        global.dbInstance.collection('room').insertOne({
                            roomId: roomId,
                            roomName: req.body.roomName,
                            roomDescription: req.body.roomDescription,
                            roomLogo: 'assets/room/' + roomId + '/logo.' + req.body.logoSuffix
                        });
                        res.send({
                            code: configMap.statusCode.ok,
                            msg: {
                                content: '创建房间成功',
                                title: '成功'
                            }
                        })
                    }
                })
            } else {
                res.send({
                    code: configMap.statusCode.error,
                    msg: {
                        content: '房间已经存在',
                        title: '错误'
                    }
                })
            }
        }
    })
});
router.get('/room-info', function (req, res) {
    var curRoom = req.session.curRoom;
    global.dbInstance.collection('room').find({
        roomId: curRoom
    }, {'_id': 0}).next(function (err, doc) {
        if (!err) {
            if (doc) {
                doc.code = configMap.statusCode.ok;
                res.send(doc)
            }
        }
    })
});

router.post('/modify-room', upload.single('roomLogo'), function (req, res) {
    var curRoom = req.session.curRoom;
    var newInfo = {};
    if (req.file) {
        fs.writeFileSync(path.join(storePath, curRoom, 'logo.' + req.body.logoSuffix), fs.readFileSync(path.join(storePath, req.body.logoFileName)));
        fs.unlinkSync(path.join(storePath, req.body.logoFileName));
        newInfo.roomLogo = 'assets/room/' + curRoom + '/logo.' + req.body.logoSuffix;
    }
    newInfo.roomDescription = req.body.roomDescription;
    global.dbInstance.collection('room').updateOne({roomId: curRoom}, {
        $set: newInfo
    });
    res.send({
        code: configMap.statusCode.ok,
        msg: {
            content: '修改房间成功',
            title: '成功'
        }
    })


});


module.exports = router;