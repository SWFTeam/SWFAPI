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
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
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

async function _getAllAdvices(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    if(req.body){
        let advices = [];
        const advs = await db.select("*", "advice");
        for(advice of advs){
            let descriptions = []
            let description = await db.select("*", "description", "type='advice' AND foreign_id=" + advice.id);
            descriptions.push(description)
            advices.push({
                id: advice.id,
                descriptions: description
            });
        };
        if(advs.errno){
            res.status(INT_ERR).send({ error: "Internal server error." });
            return;
        }
        res.status(SUCCESS).send(advices);
    }
}

async function _getAdvice(req, res){
    //Token VERIF
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
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
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    db.connect(conf.db_server);
    console.log(req.body);
    if(req.body.id){
        let adviceId = req.body.id;
        const prefRes = await db.delete('preference_advice', 'advice_id=' + adviceId);
        if(prefRes.errno){
            res.status(INT_ERR).send({ error: "Something bad occurs, please try again later..."})
        }
        const descRes = await db.delete('description', 'foreign_id=' + adviceId + " AND type=\"advice\"");
        if(descRes.errno){
            res.status(INT_ERR).send({ error: "Something bad occurs, please try again later..."})
        }
        const adviceRes = await db.delete('advice', 'id=' + adviceId);
        if(adviceRes.errno){
            res.status(INT_ERR).send({ error: "Something bad occurs, please try again later..."})
        }
        res.status(SUCCESS).send({ message: "Data successfully deleted." });
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }

    db.close();
}

async function _updateAdvice(req, res){
    //Token VERIF
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    db.connect(conf.db_server);
    if(req.body){
        let adviceId = req.body.id;
        let descriptions = req.body.descriptions;
        descriptions.forEach(async (description) => {
            description.foreign_id = adviceId;
            const descriptionRes = await descrUtils.update(description);
            console.log(descriptionRes)
            if(descriptionRes.errno){
                res.status(INT_ERR).send({ error: "Something bad occurs, please try again later..."})
                return;
            }
        });
        res.status(SUCCESS).send({ message: "Data successfully updated." });
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
    //db.close();
}

module.exports = {
    create: _createAdvice,
    getAdvice: _getAdvice,
    getAllAdvices: _getAllAdvices,
    delete: _deleteAdvice,
    update: _updateAdvice
}