const db = require("../database/database.js");
/**
 * Insert description 
 * @param {(Object)Description} description 
 */
async function _insert(description){
    let attributes;
    let values = [];
    for(attr in description){
            attributes == null ? attributes = attr : attributes += "," + attr;
            values.push(description[attr]);
        }
    return await db.insert("description", attributes, [values]);
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