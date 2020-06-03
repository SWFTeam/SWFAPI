/*
*
* ROUTES FOR EVENTS MANIPULATION
*
*/
const db = require('../database/database.js');
const conf = require('../database/conf.js');
const token = require('../dist/token.js');
const SUCCESS = 200;
const CREATED = 201;
const UPDATED = 204;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const FORBIDDEN = 403;
const INT_ERR = 500;

async function _status(req, res){
    db.connect(conf.db_server);
    let users = await db.select("*", "user");
    let result = {}
    if(!users.errno){
        result.mysql_status = "running";
    } else {
        result.mysql_status = "down";
    }
    result.api_state = "running";
    res.status(SUCCESS).send(result);
}

module.exports = {
    status: _status
}