/**
 * Created by tcstory on 2/12/16.
 */


var configMap = require('./config.js');
function cros(res) {
    res.set('Access-Control-Allow-Origin', configMap.allowOrigin);
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.set('Access-Control-Allow-Credentials', 'true');
}

function createIdForVisitor(peopleList) {
    var id;
    do {
        id = 'v' + parseInt(Math.random() * 100000);
    } while (checkDuplicatedId(id, peopleList));
    return id;
}

module.exports = {
    cros: cros,
    createIdForVisitor: createIdForVisitor
};