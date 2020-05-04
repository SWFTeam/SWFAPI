/**
 * ROUTES FOR USER MANIPULATIONS
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

async function _createChallenge(req, res){
    db.connect(conf.db_server);
    if(req.body){
        let challenge = req.body.challenge;
        let needs = req.body.needs;
        //Insert into experience
        const expId = await db.insert("experience", "exp", [[challenge.experience]]);
        //Insert into challenge
        const challId = await db.insert("challenge", "exp_id", [[expId]]);
        //Insert into description
        const descriptionId = await db.insert("description", "country_code, title, name, description, type, foreign_id", [[challenge.country_code, challenge.title, challenge.name, challenge.description, "challenge", challId]]);
        //Insert into preference_challenge
        let preference_challenge = [];
        for(need in needs){
            if(needs[need]){
                let needId = await db.select("need.id", "need JOIN description on need.id = description.foreign_id", "country_code = \"GB\" AND title=\"" + String(need) + "\"");
                preference_challenge.push([challId, needId[0].id]);
            }
        }
        await db.insert("preference_challenge", "chall_id, need_id", preference_challenge);
        res.status(SUCCESS).send({ result: "Data inserted successsfully" });
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
    db.close();
}

async function _getChallenge(req, res){
    db.connect(conf.db_server);
    if(req.body.id){
        const challId = req.body.id;
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
    db.close();
}

async function _deleteChallenge(req, res){
    db.connect(conf.db_server);
    if(req.body.id){
        const challId = req.body.id;
        //Delete from experience
        //Delete from preference_challenge
        //Delete from challenge
        //Delete from description
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
    db.close();
}

function _editChallenge(req, res){
    db.connect(conf.db_server);
    if(req.body.id){
        const challId = req.body.id;
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
    db.close();
}

function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

module.exports = {
    create: _createChallenge,
    getChallenge: _getChallenge,
    delete: _deleteChallenge,
    edit: _editChallenge
}