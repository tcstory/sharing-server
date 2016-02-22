/**
 * Created by tcstory on 2/17/16.
 */

module.exports = {
    defaultRoom: 'r10001',
    defaultAvatar: '/assets/images/default-avatar.png',
    mongoDBUrl: 'mongodb://localhost:27017/test',
    visitorTextPrompt: '游客',
    allowOrigin: 'http://127.0.0.1:9999',
    defaultPushMessagesNumber: 100,
    statusCode: {
        ok: 200,
        error: 5000
    },
    userIdStartNumber: 10000,
    userIdPrefixCharacter: 'u'
};