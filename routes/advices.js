/**
 * ROUTES FOR ADVICE MANIPULATIONS
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

async function _createAdvice(req, res){
    //Token VERIF
    /*const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }*/

    db.connect(conf.db_server);
    if(req.body){
        let descriptions = req.body.descriptions;
        let needs = req.body.needs;

        //Insert into Advice
        const adviceId = await db.insert("advice", "", [[]]);
        
        //Insert into description
        descriptions.forEach(async (description) => {
            description.foreign_id = adviceId;
            const descriptionId = await descrUtils.insert(description);
            if(descriptionId.errno){
                let code = INT_ERR;
                let message = "Something bad occurs, please try again later...";
                res.status(code).send({ error: message})
            }
        });

        //Insert into preference_advice
        let preference_advice = [];
        for(need in needs){
            if(needs[need]){
                let needId = await db.select("need.id", "need JOIN description on need.id = description.foreign_id", "country_code = \"GB\" AND title=\"" + String(need) + "\"");
                preference_advice.push([adviceId, needId[0].id]);
            }
        }
        await db.insert("preference_advice", "advice_id, need_id", preference_advice);
        res.status(SUCCESS).send({ result: "Data inserted successsfully" });
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }

    db.close();
}

async function _getAdvice(req, res){
    //Token VERIF
    /*const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }*/
    db.connect(conf.db_server);
    if(req.body.id){
        let adviceId = req.body.id;
        //const advice = await db.select("*", "advice", "id=" + adviceId);
        const descriptions = await db.select("*", "description", "foreign_id=" + adviceId + " AND type=\"advice\"");
        let descrs = [];
        descriptions.forEach(description => {
            descrs.push(description);
        })
        const adviceResult = {
            id: adviceId,
            descriptions: descrs
        }
        res.status(SUCCESS).send({ adviceResult });
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }

    db.close();
}

async function _deleteAdvice(req, res){
    //Token VERIF
    /*const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }*/
    if(req.body.id){
        let adviceId = req.body.id;
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
}

function _editAdvice(req, res){
    //Token VERIF
    /*const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }*/
    if(req.body){
        let advice = req.body.advice;
        let adviceId = advice.id;
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
}

module.exports = {
    create: _createAdvice,
    getAdvice: _getAdvice,
    delete: _deleteAdvice,
    edit: _editAdvice
}