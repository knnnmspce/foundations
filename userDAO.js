const AWS = require('aws-sdk');
const uuid = require('uuid');

AWS.config.update({
    region: 'us-east-2'
});

const docClient = new AWS.DynamoDB.DocumentClient();

function retrieveUserByUsername(username){
    const params = {
        TableName: 'reimburse_users',
        Key: {
            username
        }
    }

    return docClient.get(params).promise();
}

function createNewUser(username, password){
    const params = {
        TableName: 'reimburse_users',
        Item: {
            username,
            password,
            authority_lvl: 'employee' //setting the default authority level to employee by default
        }
    }

    return docClient.put(params).promise();
}

module.exports = {
    retrieveUserByUsername,
    createNewUser
}