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
    res.send('SWF API v0');
})

console.log(db.insert("node", [[2, "TEST D'ATTRIBUT"]]));

