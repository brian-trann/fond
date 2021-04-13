/** Routes for recipes */

const express = require('express');
const Recipe = require('../models/recipes');
const router = express.Router();

/**
 * GET / => 
 * 	{ recipes : [ { id, url, raw_recipe, keywords, title } ] }
 * 
 */
router.get('/', async (req, res, next) => {
	try {
		// validate limit and skip
		const limit = parseInt(req.query.limit);
		const skip = parseInt(req.query.skip);
		const recipes = await Recipe.getRecipes(limit, skip);
		return res.json({ recipes });
	} catch (error) {
		return next(error);
	}
});

/**
 * GET /:id 
 */
router.get('/:id', async (req, res, next) => {
	try {
		const recipe = await Recipe.get(req.params.id);
		return res.json({ recipe });
	} catch (error) {
		return next(error);
	}
});
module.exports = router;
