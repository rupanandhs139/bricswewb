const jwt = require('jsonwebtoken');
const Constant = require('../config/constant')

/**
 * 
 * @param {*} tokenConfig 
 * tokenConfig.uniqueId - uniqueIdentifier
 * tokenConfig.type - google, mobile
 */

var createToken = (tokenConfig) => {
    let promise = new Promise((resolve, reject) => {
        if (tokenConfig) {
            if (tokenConfig.type) {
                if (!(tokenConfig.type == 'google'
                    || tokenConfig.type == 'mobile'
                    || tokenConfig.type == 'email')) {
                        console.log("Invalid token type: " + tokenConfig.type);
                        reject('invalid token type');
                }
            }

             else {
                console.log("Token type is missing in createToken");
                reject('token type is missing');
            }

            if (!tokenConfig.uniqueId) {
                console.log("Token unique id is missing in createToken");
                reject('token unique id is missing');
            }

            let token = jwt.sign(tokenConfig, Constant.secret, { expiresIn: Constant.expireIN });
            if (token) {
                resolve(token);
            } else {
                reject();
            }
        }
        
        else {
            reject('token config is null or undefined');
        }
    });
    return promise;
};

module.exports = {
    createToken
}