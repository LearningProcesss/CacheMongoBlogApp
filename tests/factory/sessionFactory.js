const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygripObj = new Keygrip([keys.cookieKey]);

module.exports = id => {
    const session = {
        passport: {
            user: id
        }
    };
    const sessionString = Buffer.from(JSON.stringify(session)).toString('base64');

    const sig = keygripObj.sign('session=' + sessionString);

    return {
        sessionString,
        sig
    };
}
