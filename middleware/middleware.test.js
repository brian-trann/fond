const { ensureValidUri } = require('./middleware');
const { BadRequestError } = require('../expressError');

describe('ensureValidUri', () => {
	const testUrl =
		'https://www.seriouseats.com/recipes/2013/11/sous-vide-deep-fried-turkey-porchetta-recipe.html';

	test('works with valid url', () => {
		expect.assertions(1);
		const req = { query: { url: testUrl } };
		const res = {};
		const next = (err) => {
			expect(err).toBeFalsy();
		};
		ensureValidUri(req, res, next);
	});
	test('works: throws error with invalid url', () => {
		expect.assertions(1);
		const req = { query: { url: 'invalid-url' } };
		const res = {};
		const next = (err) => {
			expect(err instanceof BadRequestError).toBeTruthy();
		};
		ensureValidUri(req, res, next);
	});
	test('works: throws error with empty string as url', () => {
		expect.assertions(1);
		const req = { query: { url: '' } };
		const res = {};
		const next = (err) => {
			expect(err instanceof BadRequestError).toBeTruthy();
		};
		ensureValidUri(req, res, next);
	});
});
