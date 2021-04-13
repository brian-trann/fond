/** Helper function to make a string that */
const SHA256 = require('crypto-js/sha256');
const { DAYS_TO_EXPIRATION } = require('../config');
/**
 * generateEmailTokenAndDate is a helper function that will create an
 *  email token and a token expiration in order for a user to validate
 *  their email
 * 
 * @returns {Object} emailToken: random string, 
 *       tokenExpiration : primitive value of a date
 */
const generateEmailTokenAndDate = () => {
	const randomNumString = () => {
		// 10000 is an arbitrary number
		return Math.floor(Math.random() * 10000).toString();
	};
	const generateExpirationDate = () => {
		const date = new Date();
		date.setDate(date.getDate() + DAYS_TO_EXPIRATION);
		return date.valueOf().toString();
	};
	const hash = SHA256(randomNumString()).toString();

	const date = generateExpirationDate();

	return { emailToken: hash, tokenExpiration: date };
};

module.exports = { generateEmailTokenAndDate };
