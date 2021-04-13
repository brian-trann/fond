/** Shared config file for app */

require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'secret-dev';

const PORT = +process.env.PORT || 3001;

const getDatabaseUri = () => {
	return process.env.NODE_ENV === 'test' ? 'fond_test' : process.env.DATABASE_URL || 'fond';
};

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === 'test' ? 1 : 12;

const DAYS_TO_EXPIRATION = 1;

console.log('~~~~~');
console.log('Fond - Config:');
console.log('SECRET_KEY: ', SECRET_KEY);
console.log('BCRYPT_WORK_FACTOR: ', BCRYPT_WORK_FACTOR);
console.log(`PORT: ${PORT}`);
console.log('Database: ', getDatabaseUri());
console.log('~~~~~');

module.exports = {
	SECRET_KEY,
	PORT,
	getDatabaseUri,
	BCRYPT_WORK_FACTOR,
	DAYS_TO_EXPIRATION
};
