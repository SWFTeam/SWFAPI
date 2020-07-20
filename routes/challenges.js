/**
 * ROUTES FOR CHALLENGES MANIPULATIONS
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
    if(req.body){
        console.log(req.body);
        let challenge = req.body;
        let descriptions = req.body.descriptions;
        let needs = req.body.needs;
        //Insert into experience
        const expId = await db.insert("experience", "exp", [[challenge.experience]]);
        //Insert into challenge
        const challId = await db.insert("challenge", "exp_id", [[expId]]);
        //Insert into description
        descriptions.forEach(async (description) => {
            description.foreign_id = challId;

            const descriptionid = await descrUtils.insert(description);
            //console.log(descriptionid.errno);
            if(descriptionid.errno){
                let code = INT_ERR;
                let message = "Something bad occurs, please try again later...";
                switch(descriptionid.errno){
                    case 1062:
                        code = BAD_REQUEST;
                        message = "Duplicate entry for challenge";
                        break;
                    default:
                        break;
                }
                res.status(code).send({ error: message});
                return;
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
        res.status(CREATED).send({ result: "Data inserted successsfully" });
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
    db.close();
}

async function _getAllChallenges(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    if(req.body){
        let challenges = [];
        const challs = await db.select("*", "challenge");
        for(chall of challs){
            let description = await db.select("*", "description", "type='challenge' AND foreign_id=" + chall.id);
            let experience = await db.selectExpByChall(chall.id);
            if(experience[0]){
                experience = experience[0].exp;
            } else {
                experience = 0;
            }
            challenges.push({ 
                id: chall.id, 
                description, 
                experience });
        };
        if(challs.errno){
            res.status(INT_ERR).send({ error: "Internal server error." });
            return;
        }
        res.status(SUCCESS).send(challenges);
    }
}

async function _getChallenge(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    if(req.body){
        const challId = req.body.id;
        const descriptions = await db.select("*", "description", "foreign_id=" + challId + " AND type=\"challenge\"");
        let experience = await db.selectExpByChall(challId);
        let descrs = [];
        console.log(challId)
        descriptions.forEach(description => {
            descrs.push(description);
        })
        const challenge = {
            id: challId,
            description: descrs
        }
        console.log(experience)
        challenge["experience"] = experience[0].exp
        res.status(SUCCESS).send({ challenge });
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
    //db.close();
}

async function _deleteChallenge(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    if(req.body){
        const challId = req.body.id;
        const expId = await db.select('exp_id', 'challenge', 'id=' + challId);
        const prefRes = await db.delete('preference_challenge', 'chall_id=' + challId);
        const challRes = await db.delete('challenge', 'id=' + challId);
        let expRes = "null";
        if(expId[0]) expRes = await db.delete('experience', 'id=' + expId[0].exp_id);
        const descRes = await db.delete('description', 'foreign_id=' + challId + " AND type=\"challenge\"");
        if(prefRes.errno || challRes.errno || expRes.errno || descRes.errno ){
            res.status(INT_ERR).send({ status: "Something bad occurs, contact someone..." });
        } else {
            res.status(SUCCESS).send({ status: "Challenge deleted successfully" });
        }
    } else {
        res.status(INT_ERR).send({ status: "Something bad occurs, contact someone..." });
    }
    db.close();
}

async function _updateChallenge(req, res){
    //Token VERIF
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    db.connect(conf.db_server);
    if(req.body){
        let challengeId = req.body.id;
        let descriptions = req.body.descriptions;
        let experience = req.body.experience;
        descriptions.forEach(async (description) => {
            description.foreign_id = challengeId;
            const descriptionRes = await descrUtils.update(description);
            if(descriptionRes.errno){
                res.status(INT_ERR).send({ error: "Something bad occurs, please try again later..."});
                return;
            }
        });
        let needs = req.body.needs;
        if(needs) {
            for(attr in needs){
                if(needs[attr] == true){
                    const needsId = await db.select("need_id", "preference_challenge", "chall_id=" + challengeId);
                    const needDescr = await db.select("*", "description", "title=\"" + attr + "\" AND type=\"need\"");
                    needsId.forEach(id => {
                        console.log(needDescr)
                        if(id.need_id == needDescr[0].foreign_id){
                            
                        }
                    })
                }
            }
        }
        console.log(req.body)
        if(req.body.experience != undefined){
            let expRes = db.updateExp(challengeId, experience);
            if(expRes.errno){
                res.status(INT_ERR).send({ error: "Something bad occurs" });
                return;
            }
        }

        let challengeAttributes = [];
        let challengeValues = [];

        for(attr in req.body){
            if(attr != "descriptions" &&  attr != "experience" && attr != "needs"){
                challengeValues.push(req.body[attr]);
                challengeAttributes.push(attr);
            }
        }
        const challengeRes = await db.update(challengeAttributes, [challengeValues], "challenge", "id=" + challengeId);
        if(challengeRes.errno){
            res.status(BAD_REQUEST).send({ message: "Bad request please check request's body " + challengeRes.errno });
            return;
        }
        res.status(SUCCESS).send({ message: "Data updated successfully" });
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
    db.close();
}

async function _achieveChallenge(req, res){
    //Token VERIF
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    db.connect(conf.db_server);
    if(req.body){
        let challengeId = req.body.challId;
        let userEmail = req.body.userEmail;
        let userId = await db.select('id', 'user', 'email_address="' + userEmail + '"');
        if(userId[0].id){
            userId = userId[0].id;
            let achieveRes = await db.insert('achieve', 'user_id, chall_id', [[userId, challengeId]]);
            if(achieveRes == 0){
                res.status(200).send({ message: "User " + userId +" successfully achieved challenge n° " + challengeId });
            } else {
                res.status(INT_ERR).send({ error: "Something bad occurs" });
            }
        }
    } else {
        res.status(BAD_REQUEST).send({ error: "Missing parameters" });
    }
}

async function _getAllCompleteChallenges(req, res){
    //Token VERIF
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    db.connect(conf.db_server);
    if(req.body){
        let userEmail = req.body.userEmail;
        let challengesRes = await db.selectAchieve(userEmail);
        let challengesId = [];
        if(challengesId.errno){
            res.status(INT_ERR).send({ error: "Something bad occurs" });
            return;
        }
        challengesRes.forEach(challId => {
            challengesId.push(challId.chall_id);
        })
        res.status(SUCCESS).send({ completed: challengesId });
    } else {
        res.status(BAD_REQUEST).send({ error: "Missing parameters" });
    }
}

module.exports = {
    create: _createChallenge,
    get: _getChallenge,
    getAllChallenges: _getAllChallenges,
    delete: _deleteChallenge,
    put: _updateChallenge,
    achieve: _achieveChallenge,
    completed: _getAllCompleteChallenges
}