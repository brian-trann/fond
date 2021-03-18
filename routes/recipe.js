/** Routes for recipes */

const express = require('express');
const Fond = require('../fond');
const { ensureValidUri } = require('../middleware');
const router = express.Router();

/**
 * GET / 
 *    ?url
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
router.get('/', ensureValidUri, async (req, res, next) => {
	try {
		const url = req.query.url;
		const fond = await Fond.scrapeFond(url);
		return res.json({ recipe: fond });
	} catch (error) {
		return next(error);
	}
});

/**
 * GET /md/
 * 
 * Returns { markup : 
 *              { markdown : { header, ingredients , instructions}
 *        }
 */
router.get('/md', ensureValidUri, async (req, res, next) => {
	try {
		const url = req.query.url;
		const fond = await Fond.scrapeFond(url);
		const { markdown } = Fond.formatFond(fond);
		return res.json({ markup: { markdown } });
	} catch (error) {
		return next(error);
	}
});

/**
 * GET /txt/
 * 
 * Returns { markup : 
 *              { text : { header, ingredients , instructions}
 *          }
 */
router.get('/txt', ensureValidUri, async (req, res, next) => {
	try {
		const url = req.query.url;
		const fond = await Fond.scrapeFond(url);
		const { text } = Fond.formatFond(fond);
		return res.json({ markup: { text } });
	} catch (error) {
		return next(error);
	}
});
/**
 * GET /all/
 * 
 * Returns { markup : 
 *              { markdown : { header, ingredients , instructions}, 
 *                  text :  { header, ingredients , instructions} 
 *              }, 
 *        recipe : fond }
 * 
 */
router.get('/all', ensureValidUri, async (req, res, next) => {
	try {
		const url = req.query.url;
		const fond = await Fond.scrapeFond(url);
		const { markdown, text } = Fond.formatFond(fond);
		return res.json({ markup: { markdown, text }, recipe: fond });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
