const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
const {DocumentCLient} = require('aws-sdk/clients/dynamodb');

function createJWT(username, authority){
    return jwt.sign({
        username,
        authority
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