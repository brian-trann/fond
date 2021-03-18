const express = require('express');
const { NotFoundError } = require('./expressError');
const recipeRoutes = require('./routes/recipe');
const morgan = require('morgan');

/** Express app for Fond webapp */

// app.use(cors());
const app = express();
app.use(express.json());
app.use(morgan('tiny'));

/** Routes */
app.use('/recipe', recipeRoutes);

/** 404 Handler */
app.use((req, res, next) => {
	return next(new NotFoundError());
});

/** General Error Handler */
app.use((err, req, res, next) => {
	if (process.env.NODE_ENV !== 'test') console.error(err.stack);
	const status = err.status || 500;
	const message = err.message;

	return res.status(status).json({
		error : { message, status }
	});
});
module.exports = app;
