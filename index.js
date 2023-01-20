const express = require('express');
const parser = require('body-parser');

const {retrieveUserByUsername, createNewUser} = require('./userDAO');
const bodyParser = require('body-parser');
const {createJWT, verifyTokenAndReturnPL} = require('./jwt-util');

const PORT = 8080;
const app = express();

app.use(bodyParser.json());

app.post('/login', async (req, res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;

    const data = await retrieveUserByUsername(username);
    const userItem = data.Item;

    if(userItem){
        if(userItem.password === password) {
            const token = createJWT(userItem.username, userItem.authority);

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
})

app.post('/signup', async (req, res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
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
    
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
