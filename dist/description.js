const db = require("../database/database.js");
const conf = require('../database/conf.js');
/**
 * Insert description 
 * @param {(Object)Description} description 
 */
async function _insert(description){
    db.connect(conf.db_server);
    let attributes;
    let values = [];
    for(attr in description){
            attributes == null ? attributes = attr : attributes += "," + attr;
            values.push(description[attr]);
        }
    let result;
    try{
        result = await db.insert("description", attributes, [values]);
    } catch(e){
        //console.error(e);
        result = e;
    }
    return result
}

async function _update(description){
    let attributes = [];
    let values = [];
    for(attr in description){
        attributes.push(attr);
        values.push(description[attr]);
    }
    return await db.update(attributes, [values], "description", "foreign_id=" + description.foreign_id + " and country_code=\"" + description.country_code + "\" and type=\"" + description.type +"\"");
}

module.exports = {
    insert : _insert,
    update : _update
}