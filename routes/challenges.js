/**
 * ROUTES FOR USER MANIPULATIONS
 */

const db = require('../database/database.js');
const conf = require('../database/conf.js');
const token = require('../dist/token.js');
const descrUtils = require('../dist/description.js');
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
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    const userId = decoded.id[0].id;
    if(req.body){
        let challenge = req.body.challenge;
        let descriptions = req.body.challenge.descriptions;
        let needs = req.body.challenge.needs;
        //Insert into experience
        const expId = await db.insert("experience", "exp", [[challenge.experience]]);
        //Insert into challenge
        const challId = await db.insert("challenge", "exp_id", [[expId]]);
        //Insert into description
        descriptions.forEach(async (description) => {
            description.foreign_id = challId;
            const descriptionid = await descrUtils.insert(description);
            if(descriptionId.errno){
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
            }
        });
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
        //const chall = await db.select("*", "challenge");
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
    db.close();
}

async function _deleteChallenge(req, res){
    db.connect(conf.db_server);
    if(req.body){
        const challId = req.body.id;
        const expId = await db.select('exp_id', 'challenge', 'id=' + challId);

        const prefRes = await db.delete('preference_challenge', 'chall_id=' + challId);
        const challRes = await db.delete('challenge', 'id=' + challId);
        const expRes = await db.delete('experience', 'id=' + expId[0].exp_id);
        console.log(prefRes, challRes, expRes);
        if(prefRes.errno || challRes.errno || expRes.errno){
            res.status(INT_ERR).send("Something bac occurs, contact someone...");
        } else {
            res.status(SUCCESS).send("Challenge deleted successfully");
        }
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

module.exports = {
    create: _createChallenge,
    getChallenge: _getChallenge,
    delete: _deleteChallenge,
    edit: _editChallenge
}