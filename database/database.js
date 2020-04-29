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
        if (err) throw err;
        console.log("Connected to " + db_server.database);
    });
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
        console.error(e);
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
    insert: _insertInto,
    select: _select
}