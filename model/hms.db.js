///model/hms.db.js
//import mysql2
const mysql = require("mysql2");
require("dotenv/config");
//import db config
//const dbConfig = require("../config/hms.config.js");
//create db connection object
const connection = mysql.createConnection({
	'user': process.env.USER,
	'host': process.env.HOST,
	'password': process.env.PASSWORD,
	'database': process.env.DATABASE,
	'port': process.env.DBPORT
});
//connect to db
connection.connect((error) => {
	if (error) return console.log("Database connection error", error);
	else console.log("Database connected!!!");
});
//export connection
module.exports = connection;