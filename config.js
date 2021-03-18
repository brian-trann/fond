/** Shared config file for app */

require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'secret-dev';

const PORT = +process.env.PORT || 3000;
console.log('Fond - Config:');
console.log(`PORT: ${PORT}`);
console.log('~~~~~');

module.exports = {
	SECRET_KEY,
	PORT
};
