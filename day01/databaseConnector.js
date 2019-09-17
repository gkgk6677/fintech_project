var mysql = require('mysql');

var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '0000',
    database : 'fintech'
});

connection.connect();


connection.query("SELECT * FROM user", function(err,results, fields){
    if(err){
        throw err;
    }else{
        console.log(results);
    }
});
connection.end();