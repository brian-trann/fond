const express = require('express');
const app = express();
const ExpressError = require('./expressError');

// Do we want to separate this out for more routes in the future?
// const ExpressError = require('./expressError');

app.use(express.json());

app.get('/', (req, res) => {
	res.json({ test: 'test' });
});

app.post('/', (req, res) => {
	if (!req.body.url) throw new ExpressError('Provide a link to Serious Eats', 404);
	const seriousUrl = req.body.url;
	// will do stuff here
	res.status(201).json({ recieved: seriousUrl });
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
