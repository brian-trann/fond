const { BadRequestError } = require('../expressError');
const validUrl = require('valid-url');
/**
 * ensureValidUri:
 *  - is the req.body.url : a well formed uri?
 */
const ensureValidUri = (req, res, next) => {
	try {
		if (!validUrl.isUri(req.body.url)) {
			throw new BadRequestError('URL param provided does not look like a URL');
		}
		return next();
	} catch (error) {
		return next(error);
	}
};

module.exports = { ensureValidUri };
