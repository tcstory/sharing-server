/**
 * Created by tcstory on 2/17/16.
 */

module.exports = {
    debugging: function (fnSuccess, fnError) {
        if (process.env.NODE_ENV === 'development') {
            fnSuccess()
        } else {
            fnError()
        }
    }
};