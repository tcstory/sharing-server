/**
 * Created by tcstory on 2/12/16.
 */

function cros(res) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
}

function getCurUserList() {
    return [
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
    ];
}

function getActivities() {
    return  [
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
    ];
}

function getMessages() {
    return [
        {
            userAvatar: 'http://7qn8rp.com1.z0.glb.clouddn.com/dog.jpg',
            userName: '爱情来过',
            userId: '',
            content: '有人吗?'
        },
        {
            userAvatar: 'http://7qn8rp.com1.z0.glb.clouddn.com/dog.jpg',
            userName: '大兄弟',
            userId: '',
            content: '额没有哦'
        },
        {
            userAvatar: 'http://7qn8rp.com1.z0.glb.clouddn.com/dog.jpg',
            userName: '中华田园犬',
            userId: '',
            content: '要干嘛啊?'
        }
    ]
}

module.exports = {
    cros: cros,
    getCurUserList: getCurUserList,
    getActivities: getActivities,
    getMessages: getMessages
};