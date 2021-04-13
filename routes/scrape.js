/** Route for the scraping functionality */

const express = require('express');
const Fond = require('../fond');
const { ensureValidUri } = require('../middleware/middleware');
const router = express.Router();

/**
 * POST / 
 *    { url } => { recipe : fond}
 * 
 * Returns {recipe: fond}
 *   where fond is the raw ld+json data with the schema type: Recipe
 *   that is scraped from the given URL
 * 
 * More info on Recipe Schema
 *  - Typically used for SEO
 *  - https://developers.google.com/search/docs/data-types/recipe
 * 
 */
router.post('/', ensureValidUri, async (req, res, next) => {
	try {
		const url = req.body.url;
		const fond = await Fond.scrapeFond(url);
		// insert into DB
		return res.json({ recipe: fond });
	} catch (error) {
		return next(error);
	}
});
