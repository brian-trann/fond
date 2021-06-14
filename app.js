'use strict';
const express = require('express');
const { NotFoundError } = require('./expressError');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipe');

const userRoutes = require('./routes/users');
const morgan = require('morgan');
const cors = require('cors');
const { authenticateJWT } = require('./middleware/auth');
/** Express app for Fond webapp */

const app = express();
const corsOptions = {
	origin               : 'https://hard-verse.surge.sh',
	optionsSuccessStatus : 200
};
// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(authenticateJWT);
/** Routes */
app.use('/recipe', recipeRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

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
