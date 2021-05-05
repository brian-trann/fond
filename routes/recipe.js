/** Routes for recipes */

const express = require('express');
const Recipe = require('../models/recipes');
const router = express.Router();
const { ensureValidUri } = require('../middleware/middleware');

/**
 * GET / => 
 * 	{ recipes : [ { id, url, raw_recipe, keywords, title } ] }
 * 
 */
router.get('/', async (req, res, next) => {
	try {
		// validate limit and skip
		const limit = parseInt(req.query.limit || 15);
		const skip = parseInt(req.query.skip || 0);

		const recipes = await Recipe.getRecipes(limit, skip, req.query.search);
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
/**
 * POST /scrape
 *    { url } => { response: {recipe : {} , success: BOOL }}
 *    { url } => { response: {error : STRING , success: BOOL }}
 * 
 * Returns {recipe: fond}
 *   where fond is the raw ld+json data with the schema type: Recipe
 *   that is scraped from the given URL
 * 
 * More info on Recipe Schema
 *  - Typically used for SEO
 *  - https://developers.google.com/search/docs/data-types/recipe
 */
router.post('/scrape', ensureValidUri, async (req, res, next) => {
	try {
		const url = req.body.url;

		const recipe = await Recipe.createFromUrl(url);

		return res.status(201).json({ recipe });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
