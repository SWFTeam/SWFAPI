const mysql = require('mysql');
let _con;

function _connect(db_server){
    //console.log(db_server)
    _con = mysql.createConnection({
        host: db_server.host || "localhost",
        user: db_server.username || "root",
        password: db_server.password || "root",
        database: db_server.database || "SWF"
    });
    _con.connect(function(err) {
        if (err) throw err;
        console.log("Request to", db_server.database, "database");
    });
}

function _close(){
    _con.end();
}

async function _insertInto(table, attributes, data){
    try {
        let insertedRequest = await _insertRequest(table, "insert");
        let sql = "INSERT INTO " + table  + " (" + attributes + ") VALUES ?;";
        console.log(sql);
        console.log(data);
        let result = await asyncQuery(sql, data);
        return result.insertId;
    } catch(e) {
        console.error(e.sqlMessage);
        return e;
    }
}

async function _select(attributes, table, where){
    try {
        let insertedRequest = await _insertRequest(table, "select");
        let sql = "SELECT " + attributes + " FROM " + table;
        if(where){
            sql += " WHERE " + where;
        }
        let result = await asyncQuery(sql);
        return result;
    } catch(e) {
        console.error(e.sqlMessage);
        return e;
    }
}

async function _delete(table, where){
    try {
        let insertedRequest = await _insertRequest(table, "delete");
        let sql = "DELETE FROM " + table + " WHERE " + where;
        let result = await asyncQuery(sql);
        return result;
    } catch(e){
        console.error(e.sqlMessage);
        return e;
    }
}

async function _update(attributes, values, table, where){
    try {
        let insertedRequest = await _insertRequest(table, "update");
        let i = 0;
        let sql = "UPDATE " + table + " SET ";
        attributes.forEach(async (attribute) => {
            if(i==0){
                sql += attribute + "=\"" + values[0][i] + "\""
            } else {
                sql += ", " + attribute + "=\"" + values[0][i] +"\""
            }
            i++;
        });
        if(where){
            sql += " where " + where;
        }
        let result = await asyncQuery(sql);
        return result;
    } catch(e){
        console.error(e.sqlMessage);
        return e;
    }
}

async function _updateExp(challId, exp){
    try {
        let sql = "update experience set exp = " + exp + " where id = (select exp_id from challenge where id = " + challId + ")";
        let result = await asyncQuery(sql);
        return result;
    } catch(e) {
        console.error(e);
    }
}

async function _selectCountExperienceByUserId(userId){
    try {
        let sql = "SELECT sum(exp) as exp FROM experience e JOIN challenge c ON e.id = c.exp_id JOIN achieve a ON a.chall_id = c.id WHERE e.exp AND user_id = " + userId;
        let result = await asyncQuery(sql);
        return result;
    } catch(e) {
        console.error(e.sqlMessage);
    }
}

async function _selectCountExperienceEventsByUserId(userId){
    try {
        let sql = "SELECT sum(exp) as exp FROM experience e JOIN event c ON e.id = c.exp_id JOIN participate a ON a.event_id = c.id WHERE e.exp AND user_id = " + userId;
        let result = await asyncQuery(sql);
        return result;
    } catch(e) {
        console.error(e.sqlMessage);
    }
}

async function _selectAchieveByEmail(userEmail){
    try {
        let sql = "select chall_id from achieve a join user u on u.id = a.user_id where u.email_address = '" + userEmail + "'";
        let result = await asyncQuery(sql);
        return result;
    } catch(e) {
        console.error(e.sqlMessage);
    }
}

async function _selectExpByChall(challId){
    try {
        let sql = 'select exp from experience e join challenge c on e.id = c.exp_id where e.exp and c.id = ' + challId;
        let result = await asyncQuery(sql);
        return result;
    } catch (e) {
        console.error(e.sqlMessage)
    }
}

async function _selectExpByEvent(eventId){
    try {
        let sql = 'select exp from experience e join event c on e.id = c.exp_id where e.exp and c.id = ' + eventId;
        let result = await asyncQuery(sql);
        return result;
    } catch (e) {
        console.error(e.sqlMessage)
    }
}

async function _insertRequest(table, type){
    try {
        let data = [];
        data.push(table);
        data.push(type);
        data.push(new Date(Date.now()).toMysqlFormat());
        let sql = "INSERT INTO request (entity, type, date) VALUES ?;";
        let result = await asyncQuery(sql, [data]);
        return result.insertId;
    } catch(e) {
        console.error(e.sqlMessage);
        return e;
    }
}

function asyncQuery(sql, data = null){
    return new  Promise((resolve, reject) => {
        _con.query(sql, [data], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        })
    });
}

async function _selectParticipateByEmail(userEmail){
    try {
        let sql = "select event_id from participate a join user u on u.id = a.user_id where u.email_address = '" + userEmail + "'";
        let result = await asyncQuery(sql);
        return result;
    } catch(e) {
        console.error(e.sqlMessage);
    }
}

module.exports = {
    connect: _connect,
    close: _close,
    insert: _insertInto,
    select: _select,
    delete: _delete,
    update: _update,
    selectExp: _selectCountExperienceByUserId,
    selectExpEvents: _selectCountExperienceEventsByUserId,
    selectAchieve: _selectAchieveByEmail,
    selectExpByChall: _selectExpByChall,
    selectExpByEvent: _selectExpByEvent,
    updateExp: _updateExp,
    selectParticipate: _selectParticipateByEmail
}