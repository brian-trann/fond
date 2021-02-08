const express = require('express');
const app = express();
const ExpressError = require('./expressError');
const Fond = require('./fond');
// Do we want to separate this out for more routes in the future?
// const ExpressError = require('./expressError');

app.use(express.json());

app.get('/', (req, res) => {
	res.json({ test: 'test' });
});

app.post('/', (req, res, next) => {
	if (!req.body.url) throw new ExpressError('Provide a link', 404);
	const userUrl = req.body.url;
	try {
		Fond.scrapeFond(userUrl).then((fond) => {
			return res.status(201).json({ recipe: fond });
		});
	} catch (error) {
		return next(error);
	}
});

app.post('/md', (req, res, next) => {
	if (!req.body.url) throw new ExpressError('Provide a link', 404);
	const userUrl = req.body.url;
	try {
		Fond.scrapeFond(userUrl).then((fond) => Fond.formatFondMd(fond)).then((fondMd) => {
			return res.status(201).json({ markdown: fondMd });
		});
	} catch (error) {
		return next(error);
	}
});

app.post('/all', (req, res, next) => {
	if (!req.body.url) throw new ExpressError('Provide a link', 404);
	const userUrl = req.body.url;
	try {
		Fond.scrapeFond(userUrl).then((fond) => {
			const markdown = Fond.formatFondMd(fond);
			const text = Fond.formatFondText(fond);
			return res.status(201).json({ data: fond, markdown: markdown, text });
		});
	} catch (error) {
		return next(error);
	}
});

app.post('/txt', (req, res, next) => {
	if (!req.body.url) throw new ExpressError('Provide a link', 404);
	const userUrl = req.body.url;
	try {
		Fond.scrapeFond(userUrl).then((fond) => Fond.formatFondText(fond)).then((fondTxt) => {
			return res.status(201).json({ text: fondTxt });
		});
	} catch (error) {
		return next(error);
	}
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
