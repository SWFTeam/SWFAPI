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

module.exports = {
    insert : _insert
}