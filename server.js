const express = require('express');
const db = require('./database.js');
const app = express();
const log = console.log;
const PORT = 3000;

app.use(express.json());
db.connect("localhost", "root", "root", "test");

app.listen(PORT, function () {
    log('SWF API Listening ! Port:' + PORT);
})

app.get('/', (req, res) => {
    console.log("NEW CONNECTION");
    res.send('SWF API v0');
})

app.get('/test', (req, res) => {
    let json = {
        atttributTest: 'Je suis un attribut json de test',
        content: [{
            subtest: 'Je ne contient rien d\' autres que des attributs de test'
        }]
    };
    res.status(200).send(json);
})

app.get('/error', (req, res) => {
    res.status(500).send({ error: "Je suis une route de test d'erreur"});
})

//console.log(db.insert("node", [[2, "TEST D'ATTRIBUT"]]));

