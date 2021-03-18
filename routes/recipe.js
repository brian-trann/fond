/** Routes for recipes */

const express = require('express');
const Fond = require('../fond');
const ExpressError = require('../expressError');
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
router.get('/', async (req, res, next) => {
	try {
		// run middleware to check query params
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
 * Returns {markdown: fondMd}
 *   where fondMd is a formatted markdown string
 */
router.get('/md/', async (req, res, next) => {
	try {
		const url = req.query.url;
		const fond = await Fond.scrapeFond(url);
		const fondMd = Fond.formatFondMd(fond);
		return res.json({ markdown: fondMd });
	} catch (error) {
		return next(error);
	}
});

/**
 * GET /txt/
 * 
 * Returns {text: fondTxt}
 *   where fondTxt is a formatted string without special markup
 */
router.get('/txt/', async (req, res, next) => {
	try {
		const url = req.query.url;
		const fond = await Fond.scrapeFond(url);
		const fondTxt = Fond.formatFondText(fond);
		return res.json({ text: fondTxt });
	} catch (error) {
		return next(error);
	}
});
/**
 * GET /all/
 * 
 * Returns {recipe, text, markdown}
 */
router.get('/all/', async (req, res, next) => {
	try {
		const url = req.query.url;
		const fond = await Fond.scrapeFond(url);
		if (!fond) {
			throw new ExpressError('test', 400);
		}
		const fondTxt = Fond.formatFondText(fond);
		const fondMd = Fond.formatFondMd(fond);
		return res.json({ recipe: fond, text: fondTxt, markdown: fondMd });
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
