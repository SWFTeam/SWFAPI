/**
 * ROUTES FOR USER MANIPULATIONS
 */

const db = require('../database/database.js');
const conf = require('../database/conf.js');
const token = require('../dist/token.js');

const SUCCESS = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const FORBIDDEN = 403;
const INT_ERR = 500;

async function _createUser(req, res){
   db.connect(conf.db_server);
   if(req.body){
        //SET UserExperience
        let usr = req.body.user
        //ADDRESS INSERT
        let addressArr = [];
        let attributes;
        for(attr in usr.address){
            attributes == null ? attributes = attr : attributes += "," + attr;
            addressArr.push(usr.address[attr]);
        }
        delete usr.address;
        const addressId = await db.insert("address", attributes, [addressArr]);
        addressId != undefined ? usr.address_id = addressId : usr.address_id = null;
        //WORK_ADRESS INSERT
        addressArr = [];
        attributes = null;
        for(attr in usr.address_work){
            attributes == null ? attributes = attr : attributes += "," + attr;
            addressArr.push(usr.address_work[attr]);
        }
        let workId = await db.insert("address", attributes, [addressArr]);
        workId != undefined ? usr.address_work = workId : usr.address_work = null;
        //SURVEY INSERT
        let needs = req.body.needs;
        let preference_survey = [];
        usr.survey_id = await db.insert("survey", "id", [[null]]);
        for(need in needs){
            if(needs[need]){
                let needId = await db.select("need.id", "need JOIN description on need.id = description.foreign_id", "country_code = \"GB\" AND title=\"" + String(need) + "\"");
                preference_survey.push([usr.survey_id, needId[0].id]);
            }
        }
        db.insert("preference_survey", "survey_id, need_id", preference_survey);
        usr.birthday = new Date(usr.birthday).toMysqlFormat();
        attributes = null;
        let user = [];
        for(attr in usr){
            attributes == null ? attributes = attr : attributes += "," + attr;
            user.push(usr[attr]);
        }
        const user_result = await db.insert("user", attributes, [user]);
        if(user_result.errno === undefined){
            res.status(CREATED).send(
                { 
                    "user_id" : user_result,
                    "token" : token.make(user_result)
                }
            );
        } else if (user_result.errno !== undefined){
            let code = INT_ERR;
            let message = "Something bad occurs, please try again later...";
            switch(user_result.errno){
                case 1062:
                    code = BAD_REQUEST;
                    if(user_result.sqlMessage.indexOf("email") !== -1){
                        message = "Email already exists";
                    }
                    break;
                default:
                    break;
            }
            res.status(code).send({ error: message})
        } else {
            res.status(INT_ERR).send("Something bad occurs, please try again later...");
        }
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
}

function _getUser(req, res){

}

function _deleteUser(req, res){

}

function _editUser(req, res){

}
//TBD
function checkUser(user){
    
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
    create: _createUser
}