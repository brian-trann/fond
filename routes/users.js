/** Routes for user */

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { ensureCorrectUser } = require('../middleware/auth');
router.get('/:username', ensureCorrectUser, async (req, res, next) => {
	// This will need middleware to confirm JWT and correct User
	try {
		console.log(req.params.username);
		const user = await User.get(req.params.username);

		return res.json({ user });
	} catch (error) {
		return next(error);
	}
});

/**
 * POST /user/:username /recipes/:recipeId/like
 */
router.post('/:username/recipe/:recipeId/like', async (req, res, next) => {
	try {
		const recipeId = +req.params.recipeId;

		const recipe = await User.likeRecipe(req.params.username, recipeId);
		return res.json({ recipe });
	} catch (error) {
		return next(error);
	}
});
/**
 * POST /user/:username /recipes/:recipeId/unlike
 */
router.post('/:username/recipe/:recipeId/unlike', async (req, res, next) => {
	try {
		const recipeId = +req.params.recipeId;
		await User.unlikeRecipe(req.params.username, recipeId);
		return res.json({ unlike: recipeId });
	} catch (error) {
		return next(error);
	}
});
module.exports = router;
