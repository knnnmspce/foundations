const express = require('express');
const parser = require('body-parser');

const {retrieveUserByUsername, createNewUser, createNewTicket} = require('./userDAO');
const bodyParser = require('body-parser');
const {createJWT, verifyTokenAndReturnPL} = require('./jwt-util');

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
                console.log(userItem.username);
                console.log(userItem.authority_lvl);
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
    let isEligble = false;

    try{
        const authorizationHeader = req.headers.authorization;
        const token = authorizationHeader.split(" ")[1];
        const tokenPayload = await verifyTokenAndReturnPL(token);
        if(tokenPayload.authority_lvl === "employee"){
            isEligble = true;
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
            res.end;
        }
    }
    
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
