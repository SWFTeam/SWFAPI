/*
*
* ROUTES FOR EVENTS MANIPULATION
*
*/
const db = require('../database/database.js');
const conf = require('../database/conf.js');
const token = require('../dist/token.js');
const descrUtils = require('../dist/description.js');
const utils = require ('../dist/utils.js');
const SUCCESS = 200;
const CREATED = 201;
const UPDATED = 204;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;
const FORBIDDEN = 403;
const INT_ERR = 500;

async function _createEvent(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    let code = 201;
    let message = "success";
    if(req.body){
        let event = req.body;
        let descriptions = req.body.descriptions;
        let addressArr = [];
        let attributes = null;
        for(attr in event.address){
            attributes == null ? attributes = attr : attributes += "," + attr;
            addressArr.push(event.address[attr]);
        }
        delete event.address;
        const addressId = await db.insert("address", attributes, [addressArr]);
        addressId != undefined ? event.address_id = addressId : event.address_id = null;
        const expId = await db.insert("experience", "exp", [[event.experience]]);
        const date_start = new Date(event.date_start).toMysqlFormat();
        const date_end = new Date(event.date_end).toMysqlFormat();
        const eventId = await db.insert("event", "address_id, date_start, date_end, exp_id", [[addressId, date_start, date_end, expId]]);
        if(!eventId.errno){
            descriptions.forEach(async (description) => {
                description.foreign_id = eventId;
                const descriptionId = await descrUtils.insert(description);
                if(descriptionId.errno){
                    code = INT_ERR;
                    message = "Something bad occurs, please try again later...";
                    switch(descriptionId.errno){
                        case 1062:  
                            code = BAD_REQUEST;
                            message = "Duplicate entry for event description";
                            break;
                        default:
                            res.status(code).send({ result: message });
                            break;
                    }
                } else {
                
                }
            });
        }
        code = SUCCESS;
        message = "Data inserted successfuly"
    } else {
        code = INT_ERR;
        message = "Internal server error";
    }
    //db.close();
}

async function _getEvent(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    if(req.body){
        let eventId = req.body.id;
        let event = await db.select("*", "event", "id=" + eventId);
        let descriptions = await db.select("*", "description", "foreign_id=" + eventId + " AND type=\"event\"");
        let address = await db.select("*", "address", "id=" + event[0].address_id);
        let exp = await db.select("exp", "experience", "id=" + event[0].exp_id);
        let final_descriptions = [];
        descriptions.forEach(description => {
            final_descriptions.push(description);
        })
        let final_event = {
            id: eventId,
            address: address[0],
            descriptions: final_descriptions,
            experience: exp[0].exp
        }
        if(!event.errno){
            res.status(SUCCESS).send(final_event);
        } else {
            res.status(INT_ERR).send({ result: event.errno });
        }
    } else {
        res.status(INT_ERR).send({ result: "Something bad occurs, please try again later" });
    }
}

async function _getAllEvents(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    if(req.body){
        let events = [];
        const evts = await db.select("*", "event");
        for(evt of evts){
            let descriptions = [];
            let description = await db.select("*", "description", "type='event' AND foreign_id=" + evt.id);
            let address = await db.select("*", "address", "id=" + evt.address_id);
            let experience = await db.selectExpByEvent(evt.id);
            descriptions.push(description);
            console.log(descriptions)
            events.push({
                id: evt.id,
                address: address,
                date_start: evt.date_start,
                date_end: evt.date_end,
                experience: experience[0].exp,
                descriptions: description
            });
        };
        if(evts.errno){
            res.status(INT_ERR).send({ error: "Internal server error." });
            return;
        }
        res.status(SUCCESS).send(events);
    }
}

async function _deleteEvent(req, res){
    db.connect(conf.db_server);
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    console.log(req.body)
    if(req.body){
        const eventId = req.body.id;
        const expId = await db.select('exp_id', 'event', 'id=' + eventId);
        const eventRes = await db.delete('event', 'id=' + eventId);
        let expRes = "null";
        if(expId[0]) expRes = await db.delete('experience', 'id=' + expId[0].exp_id);
        const descRes = await db.delete('description', 'foreign_id=' + eventId + " AND type=\"event\"");
        if(eventRes.errno || expRes.errno){
            res.status(INT_ERR).send({ status: "Something bad occurs, contact someone..." });
        } else {
            res.status(SUCCESS).send({ status: "event deleted successfully" });
        }
    } else {
        res.status(INT_ERR).send({ status: "Something bad occurs, contact someone..." });
    }
    db.close();
}

async function _updateEvent(req, res){
    //Token VERIF
    const tok = req.get('Authorization');
    if(!tok) return res.status(UNAUTHORIZED).json({error: 'Unauthorized'});
    const decoded = await token.authenticate(req.headers.authorization);
    if(!decoded){
        return res.status(UNAUTHORIZED).send({error: "Not logged in."});
    }
    db.connect(conf.db_server);
    if(req.body){
        console.log(req.body)
        let eventId = req.body.id;
        let descriptions = req.body.descriptions;
        let address = req.body.address;
        const addressId = req.body.address.id;
        descriptions.forEach(async (description) => {
            description.foreign_id = eventId;
            const descriptionRes = await descrUtils.update(description);
            if(descriptionRes.errno){
                res.status(INT_ERR).send({ error: "Something bad occurs, please try again later..."});
                return;
            }
        });
        let attributes = [];
        let values = [];
        for(attr in address){
            values.push(address[attr]);
            attributes.push(attr);
        }
        const addressRes = await db.update(attributes, [values], "address", "id=" + addressId);
        if(addressRes.errno){
            res.status(BAD_REQUEST).send({ message: "Bad request, please check the request's body" });
            return;
        }
        let eventAttributes = [];
        let eventValues = [];
        for(attr in req.body){
            if(attr != "descriptions" && attr != "address" && attr != "experience"){
                if(attr == "date_start" || attr == "date_end"){
                    eventValues.push(new Date(req.body[attr]).toMysqlFormat());
                } else {
                    eventValues.push(req.body[attr]);
                }
                eventAttributes.push(attr);
            }
        }
        const eventRes = await db.update(eventAttributes, [eventValues], "event", "id=" + eventId);
        if(eventRes.errno){
            res.status(BAD_REQUEST).send({ message: "Bad request please check request's body " + eventRes.errno });
            return;
        }
        res.status(SUCCESS).send({ message: "Data updated successfully" });
    } else {
        res.status(INT_ERR).send("Something bad occurs, please try again later...");
    }
    db.close();
}

module.exports = {
    create: _createEvent,
    get: _getEvent,
    getAllEvents: _getAllEvents,
    delete: _deleteEvent,
    put: _updateEvent
}