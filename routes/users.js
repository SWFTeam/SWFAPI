/**
 * ROUTES FOR USER MANIPULATIONS
 */

const db = require('../database/database.js');
const conf = require('../database/conf.js');

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
        const insertedUser = await db.insert("user", attributes, [user]);
        console.log("Utilisateur inséré:", insertedUser);
    }
    res.send("OK");
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