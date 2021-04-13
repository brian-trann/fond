/** Database setup */

const { Client } = require('pg');
const { getDatabaseUri, SECRET_KEY } = require('./config');

// const db = new Client({
// 	connectionString : getDatabaseUri(),
// 	ssl              : {
// 		rejectUnauthorized : false
// 	}
// });
const db = new Client({
	connectionString : getDatabaseUri()
});

db.connect();

module.exports = db;
