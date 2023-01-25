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

function getTicketByTicketID(ticket_id){
    const params = {
        TableName: 'reimburse_tickets',
        Key: {
            ticket_id
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

function updateTicketStatus(ticket_id, status){
    const params = {
        TableName: 'reimburse_tickets',

        Key: {
            ticket_id
        },
        UpdateExpression: 'SET #s = :status',
        ExpressionAttributeNames: {
            "#s": "status"
        },
        ExpressionAttributeValues: {
            ':status': status
        }
    }

    return docClient.update(params).promise();
}

function getPendingTickets(){
    const params = {
        TableName: 'reimburse_tickets',
        IndexName: 'status-index',
        KeyConditionExpression: '#s = :status',
        ExpressionAttributeNames: {
            '#s': 'status'
        },
        ExpressionAttributeValues: {
            ':status': 'pending'
        }
    }

    return docClient.query(params).promise();
}

function getTicketHistory(username){
    const params = {
        TableName: 'reimburse_tickets',
        IndexName: 'username-index',
        KeyConditionExpression: '#u = :username',
        ExpressionAttributeNames: {
            '#u': 'username'
        },
        ExpressionAttributeValues:{
            ':username': username
        }
    }
    return docClient.query(params).promise();
}

module.exports = {
    retrieveUserByUsername,
    createNewUser,
    createNewTicket,
    updateTicketStatus,
    getTicketByTicketID,
    getPendingTickets,
    getTicketHistory
}