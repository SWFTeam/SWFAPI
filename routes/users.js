/**
 * ROUTES FOR USER MANIPULATIONS
 */

const db = require('../database/database.js');
const conf = require('../database/conf.js');
const token = require('../dist/token.js');
const bcrypt = require('bcrypt');

const SUCCESS = 200;
const CREATED = 201;
const UPDATED = 204;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const FORBIDDEN = 403;
const INT_ERR = 500;

const SALT = 12;

const log = console.log

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
        //PASSWORD HASHING
        usr.password = bcrypt.hashSync(usr.password, SALT);
        //USER BIRTHDAY TO MYSQL FORMAT
        usr.birthday = new Date(usr.birthday).toMysqlFormat();
        //INSERT USER
        attributes = null;
        let user = [];
        for(attr in usr){
            attributes == null ? attributes = attr : attributes += "," + attr;
            user.push(usr[attr]);
        }
        attributes += ', created_at, last_login_at';
        let now = new Date().toMysqlFormat()
        let lastLogin = new Date().toMysqlFormat()
        user.push(now);
        user.push(lastLogin);
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
    db.close();
}

async function _getUser(req, res){
    db.connect(conf.db_server)
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    let user = await db.select("id, firstname, lastname, isAdmin, last_login_at, created_at", "user", "email_address='" + req.body.email + "'");
    let xp = await db.selectExp(user[0].id);
    let xpEvents = await db.selectExpEvents(user[0].id);
    delete user[0].id;
    if(!xp.errno){
        if(xp[0] && xpEvents[0]){
            user[0].experience = xpEvents[0].exp;
            user[0].experience += xp[0].exp;
        } else if(xp[0] && !xpEvents[0]){
            user[0].experience = xp[0].exp
        } else if(!xp[0] && xpEvents[0]){
            user[0].experience = xpEvents[0].exp;
        } else {
            user[0].experience = 0;
        }
    } else {
        res.status(BAD_REQUEST).send({ error: "An error occured, please try again." });
        return;
    }
    if(!user.errno){
        res.status(SUCCESS).send(user[0]);
    } else {
        res.status(BAD_REQUEST).send({ error: "An error occured, please try again." });
    }
    return;
}

async function _getAllUsers(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    if(req.body){
        const users = await db.select("*", "user");
        if(users.errno){
            res.status(INT_ERR).send({ error: "Internal server error." });
            return;
        }
        res.status(SUCCESS).send(users);
    }
}

async function _login(req, res){
    db.connect(conf.db_server);
    if(req.body){
        const email = req.body.email;
        const password = req.body.password;
        if(!email || !password){
            res.status(BAD_REQUEST).send({error: "Missing email or password"});
        }
        //GET PASSWORD HASH FROM DB
        const hashed = await db.select("password", "user", "email_address = \"" + email + "\"");
        if(hashed.length == 0){
            res.status(FORBIDDEN).send({ error : 'Bad credentials'});
            return;
        }
        const hash = hashed[0].password;
        if(bcrypt.compareSync(password, hash)) {
            const userId = await db.select("id, isAdmin", "user", "email_address = \"" + email + "\"");
            let last_login = new Date().toMysqlFormat();
            let tmp_last = []
            tmp_last.push(last_login)
            const insert_status = await db.update(['last_login_at'], [tmp_last], "user", "id=" + userId[0].id)
            let tok = token.make(userId[0].id);
            if(req.originalUrl == '/bo/signin'){
                if(userId[0].isAdmin == 1){
                    res.status(SUCCESS).send({ token: tok, access_bo: true });
                    return;
                }
            }
            log(Date.now(), ": login user", userId);
            res.status(SUCCESS).send({ token: tok});
        } else {
            log(Date.now(), ": bad credeantials", email);
            res.status(FORBIDDEN).send({ error : 'Bad credentials'});
        }
    } else {
        res.status(INT_ERR).send({ error: "Internal server error, please try again later"});
    }
    db.close();
}

async function _deleteUser(req, res){
    console.log(Date.now(), ": delete user");
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    //const userId = decoded.id[0].id;
    const userId = req.body.userId != undefined ? req.body.userId : null;
    if(userId == null){
        console.log(req.body)
        return;
    }
    let usr = await db.select("*", "user", "id = " + userId);
    if(usr[0]){
        usr = usr[0];
        //DELETE
        const achieveRes = await db.delete("achieve", "user_id = " + usr.id);
        const surveyPreferencesRes = await db.delete("preference_survey", "survey_id = " + usr.survey_id);
        const participateRes = await db.delete("participate", "user_id = " + usr.id);
        const userRes = await db.delete("user", "id = " + usr.id);
        const addressRes = await db.delete("address", "id = " + usr.address_id);
        let workAddressRes;
        if(usr.address_work != null){
            workAddressRes = await db.delete("address", "id = " + usr.address_work);
        } else {
            workAddressRes = userRes;
        }
        const surveyRes = await db.delete("survey", "id = " + usr.survey_id);
        if(achieveRes.errno || surveyPreferencesRes.errno || participateRes.errno || userRes.errno || addressRes.errno || workAddressRes.errno || surveyRes.errno ){
            res.status(INT_ERR).send( {error: "Database delete error" } );
            return;
        }
        res.status(SUCCESS).send({ result: "Data deleted successsfully" });
    } else {
        res.status(INT_ERR).send({ error: "User not found"});
        return;
    }
    db.close();
}

async function _updateUser(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    if(req.body){
        let user = req.body
        let userId = user.id;
        let address = user.address;
        user.email_address = user.email
        if(user.is_admin){
            user.isAdmin = 1;
        } else {
            user.isAdmin = 0;
        }
        user.birthday = new Date(user.birthday).toMysqlFormat();
        user.last_login_at = new Date(user.last_login_at).toMysqlFormat();
        user.created_at = new Date(user.created_at).toMysqlFormat();
        delete user.email;
        delete user.address;
        delete user.token;
        delete user.password;
        delete user.is_admin;
        db.connect(conf.db_server);
        let attributes = [];
        let values = [];
        for(attr in user){
            attributes.push(attr);
            values.push(user[attr]);
        }
        const updateRes = await db.update(attributes, [values], "user", "id=" + userId);
        if(updateRes.errno){
            //.error("ERROR => ", updateRes);
            res.status(INT_ERR).send( {error: "Database update error" } );
            return;
        }
        res.status(SUCCESS).send({ result: "Data updated successsfully" });
        db.close();
    }
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
    create: _createUser,
    getUser: _getUser,
    getAllUsers: _getAllUsers,
    login: _login,
    delete: _deleteUser,
    update: _updateUser
}