const express = require('express');
const parser = require('body-parser');

const {retrieveUserByUsername, createNewUser, createNewTicket, updateTicketStatus, getTicketByTicketID, getPendingTickets, getTicketHistory} = require('./userDAO');
const bodyParser = require('body-parser');
const {createJWT, verifyTokenAndReturnPL} = require('./jwt-util');
const e = require('express');

const PORT = 8080;
const app = express();

app.use(bodyParser.json());

app.post('/login', async (req, res) => {
    let sufficiency = false;
    const username = req.body.username.toLowerCase();
    const password = req.body.password;

    if(req.body.username && req.body.password){
        sufficiency = true;
    } else{
        res.statusCode = 400;          
        res.send({
            'message': 'You must enter a valid username AND password'
        });
    }

    if(sufficiency){
        const data = await retrieveUserByUsername(username);
        const userItem = data.Item;
    
        if(userItem){
            if(userItem.password === password) {
                const token = createJWT(userItem.username, userItem.authority_lvl);
                res.send({
                    'message': 'Authentication Successful',
                    'token': token
                });
            } else{
                res.statusCode = 400;
                res.send({
                    'message': 'Invalid credentials. Please make sure you typed your username and password correctly'
                })
            }
        } else{
            res.statusCode = 400;
            res.send({
                'message': `Username ${username} does not exist`
            })
        }
    }
})

app.post('/signup', async (req, res) => {
    let sufficiency = false;
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    if(req.body.username && req.body.password){
        sufficiency = true;
    } else{
        res.statusCode = 400;
        res.send({
            'message': 'ERROR! You must enter both a username and password to sign up'
        })
    }
    if(sufficiency){
        const data = await retrieveUserByUsername(username);
        const userItem = data.Item;
        if(userItem){
            res.statusCode = 400;
            res.send({
                'message': 'ERROR! The username already exist!'
            });
        } else{
            const result = await createNewUser(username, password);
            if(result){
                res.send({
                    'message': 'Successfully added new user'
                });
            } else {
                res.statusCode = 400;
                res.send({
                    'message': 'There was a problem adding the user.'
                });
            }
        }
    }  
});

app.post('/fileticket', async (req, res) => {
    const amount = req.body.amount;
    const description = req.body.description;

    try{
        const authorizationHeader = req.headers.authorization;
        const token = authorizationHeader.split(" ")[1];
        const tokenPayload = await verifyTokenAndReturnPL(token);
        if(tokenPayload.authority_lvl === "employee"){
            if(amount && description){
                const result = await createNewTicket(tokenPayload.username, amount, description);
                res.statusCode = 201;
                res.send('Ticket Created!');
            }else{
                res.send('Please enter an amount and description');
            }
        }else{
            res.send('User does not have the rights for ticket submission through this system');
        }
    }catch(err){
        if(err.name === 'JsonWebTokenError'){
            res.statusCode = 400;
            res.send({
                'message': 'Invalid web token'
            });
        }else if(err.name === 'TypeError'){
            res.statusCode = 400;
            res.send({
                'message': 'No authorization header was provided'
            });
        } else{
            res.statusCode = 500;
            res.send('Server error');
        }
    }
    
})

app.patch('/ticketmanagement', async (req, res) => {
    const status = req.body.status;
    const ticket_id = req.body.ticket_id;

    try{
        const authorizationHeader = req.headers.authorization;
        const token = authorizationHeader.split(" ")[1];
        const tokenPayload = await verifyTokenAndReturnPL(token);

        const data = await getTicketByTicketID(ticket_id);
        const ticket = data.Item;
        const currentStatus = ticket.status;

        if(tokenPayload.authority_lvl === "admin"){
            if(currentStatus === "pending"){
                updateTicketStatus(ticket_id, status);
                res.send(`Updated ticket number ${ticket_id}'s status to ${status}`);
            } else {
                res.statusCode = 400;
                res.send("Unable to update ticket status on tickets that have already been approved or denied.")
            }
        } else{
            res.statusCode = 400;
            res.send('Only an admin can approve or deny tickets.');
        }
    } catch(err){
        if(typeof ticket == 'undefined'){
            res.statusCode = 400;
            res.send("Ticket does not exist!");
        } else if(err.name === 'JsonWebTokenError'){
            res.statusCode = 400;
            res.send({
                'message': 'Invalid web token'
            });
        } else if(err.name === 'TypeError'){
            res.statusCode = 400;
            res.send({
                'message': 'No authorization header was provided'
            });
        } else{
            res.statusCode = 500;
            res.send('Server error');
        }
    }
})

app.get('/pendingtickets', async (req, res) => {
    try{
        const authorizationHeader = req.headers.authorization;
        const token = authorizationHeader.split(" ")[1];
        const tokenPayload = await verifyTokenAndReturnPL(token);

        if(tokenPayload.authority_lvl === 'admin'){
            const list = await getPendingTickets();
            res.send(list);
        } else {
            res.statusCode = 400;
            res.send('Only an admin can view all pending tickets');
        }
    } catch(err){
        if(err.name === 'JsonWebTokenError'){
            res.statusCode = 400;
            res.send({
                'message': 'Invalid web token'
            });
        }else if(err.name === 'TypeError'){
            res.statusCode = 400;
            res.send({
                'message': 'No authorization header was provided'
            });
        } else{
            res.statusCode = 500;
            res.send('Server error');
        }
    }
})

app.get('/tickethistory', async (req, res) => {
    try{
        const authorizationHeader = req.headers.authorization;
        const token = authorizationHeader.split(" ")[1];
        const tokenPayload = await verifyTokenAndReturnPL(token);

        if(tokenPayload.authority_lvl === 'employee'){
            const list = await getTicketHistory(tokenPayload.username);
            res.send(list);
        } else {
            res.statusCode = 400;
            res.send({
                'message': 'Sign into an employee account to view ticket history for a user.'
            });
        }
    } catch(err){
        if(err.name === 'JsonWebTokenError'){
            res.statusCode = 400;
            res.send({
                'message': 'Invalid web token'
            });
        }else if(err.name === 'TypeError'){
            res.statusCode = 400;
            res.send({
                'message': 'No authorization header was provided'
            });
        } else{
            res.statusCode = 500;
            res.send('Server error');
        }
    }
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
