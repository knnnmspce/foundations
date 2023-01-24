const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const {DocumentCLient} = require('aws-sdk/clients/dynamodb');

function createJWT(username, authority_lvl){
    return jwt.sign({
        "username": username,
        "authority_lvl": authority_lvl
    }, 'private',
    {
        expiresIn: '1d'
    })
}

jwt.verify = Promise.promisify(jwt.verify);

function verifyTokenAndReturnPL(token){
    return jwt.verify(token, 'private');
}

module.exports = {
    createJWT,
    verifyTokenAndReturnPL
};