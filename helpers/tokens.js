const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

/**
 * Return signed JWT from user data
 */

const createToken = (user) => {
	const payload = {
		user        : user.username,
		isConfirmed : user.isConfirmed || false
	};
	return jwt.sign(payload, SECRET_KEY);
};

module.exports = { createToken };
