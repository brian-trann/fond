const express = require('express');
const app = express();
const ExpressError = require('./expressError');
const recipeRoutes = require('./routes/recipe');

// Do we want to separate this out for more routes in the future?
// const ExpressError = require('./expressError');

// app.use(cors());
app.use(express.json());

app.use('/recipe', recipeRoutes);

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
