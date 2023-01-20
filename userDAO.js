const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-2'
});

const docClient = new AWS.DynamoDB.DocumentClient();

function retrieveUserByUsername(user_id){
    const params = {
        TableName: 'tickets',
        Key: {
            user_id
        }
    }

    return docClient.get(params).promise();
}

function createNewUser(user_id, password){
    const params = {
        TableName: 'tickets',
        Item: {
            user_id,
            password,
            authority_lvl: 'employee' //setting the default authority level to employee by default
        }
    }

    return docClient.put(params).promise();
}

//function updateUserAuthority();

//function getTicketList();

//function approveTicketRequest();

//function denyTicketRequest();

module.exports = {
    retrieveUserByUsername,
    createNewUser
}