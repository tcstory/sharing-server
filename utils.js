/**
 * Created by tcstory on 2/12/16.
 */

function cros(res) {
    res.set('Access-Control-Allow-Origin', 'http://127.0.0.1:9999');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.set('Access-Control-Allow-Credentials', 'true');
}

function getCurUserList() {
    return [
        {
            userName: '爱情来过',
            userId: 10000,
            userAvatar: '/img/default-avatar.png'
        }, {
            userName: '中华田园犬',
            userId: 10001,
            userAvatar: '/img/default-avatar.png'
        }, {
            userName: '大兄弟',
            userId: 10002,
            userAvatar: '/img/default-avatar.png'
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
            userAvatar: '/img/default-avatar.png',
            userName: '爱情来过',
            userId: '',
            content: '有人吗?'
        },
        {
            userAvatar: '/img/default-avatar.png',
            userName: '大兄弟',
            userId: '',
            content: '额没有哦'
        },
        {
            userAvatar: '/img/default-avatar.png',
            userName: '中华田园犬',
            userId: '',
            content: '要干嘛啊?'
        }
    ]
}

function checkDuplicatedId(createdId, visitorList) {
    var len = visitorList.length;
    for(var i = 0; i < len; i++) {
        if (visitorList[i] === createdId) {
            return true;
        }
    }
    visitorList.push(createdId);
}

function getBasicInfo() {
    return {
        userList:  [
            {
                userName: '爱情来过',
                userId: 10000,
                userAvatar: '/img/default-avatar.png'
            }, {
                userName: '中华田园犬',
                userId: 10001,
                userAvatar: '/img/default-avatar.png'
            }, {
                userName: '大兄弟',
                userId: 10002,
                userAvatar: '/img/default-avatar.png'
            }
        ],
        messages: [
            {
                userAvatar: '/img/default-avatar.png',
                userName: '爱情来过',
                userId: '',
                content: '有人吗?'
            },
            {
                userAvatar: '/img/default-avatar.png',
                userName: '大兄弟',
                userId: '',
                content: '额没有哦'
            },
            {
                userAvatar: '/img/default-avatar.png',
                userName: '中华田园犬',
                userId: '',
                content: '要干嘛啊?'
            }
        ]
    }
}

function createIdForVisitor(visitorList) {
    var id;
    do {
        id = parseInt(Math.random() * 100000);
    } while (checkDuplicatedId(id, visitorList));
    return id;
}

module.exports = {
    cros: cros,
    getCurUserList: getCurUserList,
    getActivities: getActivities,
    getMessages: getMessages,
    createIdForVisitor: createIdForVisitor,
    getBasicInfo: getBasicInfo
};