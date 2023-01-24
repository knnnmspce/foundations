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

function createNewTicket(username, amount, description){
    const params = {
        TableName: 'reimburse_tickets',
        Item: {
            username,
            amount,
            description,
            status: 'pending',
            ticket_id: uuid.v4()
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
    createNewUser,
    createNewTicket
}