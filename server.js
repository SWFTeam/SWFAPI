const express = require('express');
const app = express();
const users = require('./routes/users.js');
const challenges = require('./routes/challenges.js');
const events = require('./routes/events.js');
const advices = require('./routes/advices.js');
const addresses = require('./routes/addresses.js');
const status = require('./routes/status.js');
const log = console.log;
const PORT = 3000;

module.exports = {
    app: app
}

app.use(express.json());

app.listen(PORT, function () {
    log('SWF API Listening ! Port:' + PORT);
})

app.get('/', (req, res) => {
    console.log("NEW CONNECTION");
    res.send('SWF API v0');
})

/**
 * USER PART
 */
app.post('/signup', users.create);
app.post('/signin', users.login);
app.delete('/user', users.delete);
app.put('/user', users.update);
app.post('/bo/signin', users.login);
app.get('/bo/users', users.getAllUsers);
app.post('/bo/user', users.getUser);

/**
 * CHALLENGE PART
 */
app.post('/challenge', challenges.get);
app.get('/bo/challenges', challenges.getAllChallenges);
app.post('/bo/challenge', challenges.create);
app.delete('/challenge', challenges.delete);
app.put('/challenge', challenges.put);
app.post('/achieve', challenges.achieve);
app.post('/completed', challenges.completed);

/**
 * EVENT PART
 */
app.post('/bo/event', events.create);
app.get('/bo/events', events.getAllEvents);
app.get('/event', events.get);
app.delete('/event', events.delete);
app.put('/event', events.put);
app.post('/participate', events.participate);
app.post('/participated', events.participated);
app.get('/event/:id', events.getById)

/**
 * ADVICE PART
 */
app.post('/bo/advice', advices.create);
app.delete('/advice', advices.delete);
app.put('/bo/advice', advices.update);
app.get('/advice', advices.getAdvice);
app.get('/bo/advices', advices.getAllAdvices);

/**
 * ADDRESS PART
 */
app.get('/address/:id', addresses.getById);
app.put('/address', addresses.update)

/**
 * Server part
 */
app.get('/status', status.status);