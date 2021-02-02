const express = require('express');
const app = express();
const ExpressError = require('./expressError');
const { scrapeFond, getNodes, parseNodes, filterRecipes, checkRecipe } = require('./helpers');

// Do we want to separate this out for more routes in the future?
// const ExpressError = require('./expressError');

app.use(express.json());

app.get('/', (req, res) => {
	res.json({ test: 'test' });
});

app.post('/', (req, res) => {
	if (!req.body.url) throw new ExpressError('Provide a link to Serious Eats', 404);
	const seriousUrl = req.body.url;
	// const nodes = await getNodes(seriousUrl);
	// const parsedNodes = await parseNodes(nodes);
	// const recipes = filterRecipes(parsedNodes);
	// const recipe = checkRecipe(recipes);
	res.status(201).json({ test: 'recipe' });
});

/** 404 Handler */
app.use((req, res, next) => {
	return new ExpressError('Not Found', 404);
});

/** General Error Handler */
app.use((err, req, res, next) => {
	res.status(err.status || 500);

	return res.json({
		error : err.message
	});
});
module.exports = app;
