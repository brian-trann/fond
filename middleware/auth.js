// /** Convenience middleware to handle common auth cases in routes. */

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { UnauthorizedError } = require('../expressError');

/** Middleware: Authenticate user.
 * 
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

const authenticateJWT = (req, res, next) => {
	try {
		const authHeader = req.headers && req.headers.authorization;
		if (authHeader) {
			const token = authHeader.replace(/^[Bb]earer /, '').trim();
			res.locals.user = jwt.verify(token, SECRET_KEY);
		}
		return next();
	} catch (err) {
		return next();
	}
};

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

const ensureLoggedIn = (req, res, next) => {
	try {
		if (!res.locals.user) throw new UnauthorizedError();
		return next();
	} catch (err) {
		return next(err);
	}
};
/**
 * Middleware to use to ensure correct user
 * 
 * If not, raises Unauthorized
 */
const ensureCorrectUser = (req, res, next) => {
	try {
		const user = res.locals.user;

		if (!user) throw new UnauthorizedError();

		if (user.user !== req.params.username) {
			console.log('ensure correct user middleware');
			throw new UnauthorizedError();
		}
		return next();
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	authenticateJWT,
	ensureLoggedIn,
	ensureCorrectUser
};
