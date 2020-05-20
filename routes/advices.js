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
        let advice = req.body.advice;
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
}

async function _getAdvice(req, res){
    //Token VERIF
    /*const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }*/
    if(req.body.id){
        let adviceId = req.body.id;
        const advice = await db.select("*", "challenge");
        res.status(SUCCESS).send({ advice: advice });
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }

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