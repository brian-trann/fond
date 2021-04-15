/** Routes for authentication */

const User = require('../models/user');
const express = require('express');
const router = new express.Router();
const jsonschema = require('jsonschema');
const { createToken } = require('../helpers/tokens');
const { BadRequestError } = require('../expressError');
const userAuthSchema = require('../schemas/userAuth.json');
const userRegisterSchema = require('../schemas/userRegister.json');
const { generateEmailTokenAndDate } = require('../helpers/emailToken');

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post('/token', async (req, res, next) => {
	try {
		const validator = jsonschema.validate(req.body, userAuthSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const { email, password } = req.body;

		const user = await User.authenticate(email, password);
		console.log(user);
		const token = createToken(user);
		return res.json({ token, isConfirmed: user.isConfirmed });
	} catch (error) {
		return next(error);
	}
});

/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post('/register', async (req, res, next) => {
	try {
		const validator = jsonschema.validate(req.body, userRegisterSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const { emailToken, tokenExpiration } = generateEmailTokenAndDate();
		const newUser = await User.register({
			...req.body,
			emailToken,
			tokenExpiration,
			isConfirmed     : false
		});

		// send email to user
		// await User.verifyEmail(emailToken,newUser.email)
		const token = createToken(newUser);

		return res.status(201).json({ token });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
