/** Routes for user */

const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/:username', async (req, res, next) => {
	try {
		const user = await User.get(req.params.username);
		return res.json(user);
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
