const bcrypt = require('bcrypt');
const { generateEmailTokenAndDate } = require('../helpers/emailToken');
const db = require('../db.js');
const { BCRYPT_WORK_FACTOR } = require('../config');

const commonBeforeEach = async () => {
	await db.query('BEGIN');
};

const commonAfterEach = async () => {
	await db.query('ROLLBACK');
};

const commonAfterAll = async () => {
	await db.end();
};

const commonBeforeAll = async () => {
	const testUser1 = generateEmailTokenAndDate();
	const emailToken1 = testUser1.emailToken;
	const tokenExpiration1 = testUser1.tokenExpiration;
	const hash1 = await bcrypt.hash('testpassword1', BCRYPT_WORK_FACTOR);
	const testUser2 = generateEmailTokenAndDate();
	const emailToken2 = testUser2.emailToken;
	const tokenExpiration2 = testUser2.tokenExpiration;
	const hash2 = await bcrypt.hash('testpassword1', BCRYPT_WORK_FACTOR);
	await db.query("DELETE FROM users WHERE email = 'test1@test.com'");
	await db.query("DELETE FROM users WHERE email = 'test2@test.com'");

	await db.query(
		`
    INSERT INTO users (email, 
                      password, 
                      username, 
                      is_confirmed, 
                      email_token, 
                      token_expiration)
    VALUES ('test1@test.com', $1 , 'testuser1','f', $2, $3 ),
          ('test2@test.com', $4 , 'testuser2','f', $5, $6 )
  `,
		[ hash1, emailToken1, tokenExpiration1, hash2, emailToken2, tokenExpiration2 ]
	);
};
module.exports = { commonAfterAll, commonAfterEach, commonBeforeAll, commonBeforeEach };
