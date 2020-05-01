const mysql = require('mysql');
let _con;

function _connect(db_server){
    //console.log(db_server)
    _con = mysql.createConnection({
        host: db_server.host || "localhost",
        user: db_server.username || "root",
        password: db_server.password || "root",
        database: db_server.database || "SWF"
    });
    _con.connect(function(err) {
        if (err) throw err
        console.log("Connected to", db_server.database, "database");
    });
}

function _close(){
    _con.end();
}

async function _insertInto(table, attributes, data){
    try {
        let sql = "INSERT INTO " + table  + " (" + attributes + ") VALUES ?;";
        let result = await asyncQuery(sql, data);
        return result.insertId;
    } catch(e) {
        console.error(e.sqlMessage);
        return e;
    }
}

async function _select(attributes, table, where){
    try {
        let sql = "SELECT " + attributes + " FROM " + table  +  " WHERE " + where;
        let result = await asyncQuery(sql);
        return result;
    } catch(e) {
        console.error(e.sqlMessage);
        return e;
    }
}

async function _delete(table, where){
    try {
        let sql = "DELETE FROM " + table + " WHERE " + where;
        let result = await asyncQuery(sql);
        return result;
    } catch(e){
        console.error(e.sqlMessage);
        return e;
    }
}

async function _update(attribute, value, table, where){
    try {
        let sql = "UPDATE " + table + " SET " + attribute + " = " + value + " WHERE " + where;
        let result = await asyncQuery(sql);
        return result;
    } catch(e){
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

module.exports = {
    connect: _connect,
    close: _close,
    insert: _insertInto,
    select: _select,
    delete: _delete
}