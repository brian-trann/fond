const express = require('express');
const { NotFoundError } = require('./expressError');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipe');
const morgan = require('morgan');
const cors = require('cors');

/** Express app for Fond webapp */

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

/** Routes */
app.use('/recipe', recipeRoutes);
app.use('/auth', authRoutes);

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
