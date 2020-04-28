const mysql = require('mysql');
let _con;

function _connect(host_, user_, password_, database_){
    _con = mysql.createConnection({
        host: host_,
        user: user_,
        password: password_,
        database: database_
    });
    _con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });
}

function _createTable(sql){
    if(_con){
        _con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Table created");
        });
    }
}

function _insertInto(table, data){
    let sql = "INSERT INTO " + table + " VALUES ?";
    _con.query(sql, [data], (err, result)=> {
        if (err) throw err;
        console.log("Record inserted: " + result.affectedRows);
    })
}

module.exports = {
    connect: _connect,
    create: _createTable,
    insert: _insertInto
}