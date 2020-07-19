/**
 * ROUTES FOR ADDRESSES MANIPULATIONS
 */

const db = require('../database/database.js');
const conf = require('../database/conf.js');
const token = require('../dist/token.js');
const descrUtils = require('../dist/description.js');
const { update } = require('../database/database.js');
const SUCCESS = 200;
const CREATED = 201;
const UPDATED = 204;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const FORBIDDEN = 403;
const INT_ERR = 500;

async function _getById(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    if(req.body && req.params.id){
        let address = await db.select("*", "address", "id=" + req.params.id);
        console.log(address)
        if(address.errno){
            res.status(INT_ERR).send({ error: "Internal server error." });
            return;
        } 
        
        res.status(SUCCESS).send(address[0]);
    }
}

async function _update(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    if(req.body){
        let address = req.body;
        console.log(address.id);
        let attributes = [];
        let values = [];
        for(attr in address){
            attributes.push(attr);
            values.push(address[attr]);
        }
        const updateRes = await db.update(attributes, [values], "address", "id=" + address.id);
        if(!updateRes.errno){
            res.send(SUCCESS).send({ message: "Successfully updated address: " + address.id});
            return;
        } else {
            res.send(INT_ERR).send({ message: "Error during update of address: " + address.id});
        }
    } else {
        res.send(INT_ERR).send({ message: "Missing request's body"});
    }
}

module.exports = {
    getById: _getById,
    update: _update
}