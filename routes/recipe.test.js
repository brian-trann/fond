const Fond = require('../fond');
const request = require('supertest');
const app = require('../app');
const { TEST_RECIPE_RESPONSE, TEST_URL } = require('./_testCommon');

describe('GET /recipe', () => {
	test('works', async () => {
		Fond.scrapeFond = jest.fn(() => Promise.resolve(TEST_RECIPE_RESPONSE));
		const resp = await request(app).get('/recipe').query({ url: TEST_URL });
		expect(resp.statusCode).toEqual(200);
	});
	test('empty url query param reponds with 400', async () => {
		const resp = await request(app).get('/recipe').query({ url: '' });
		expect(resp.statusCode).toEqual(400);
	});
	test('bad url query param reponds with 400', async () => {
		const resp = await request(app).get('/recipe').query({ url: 'not a url' });
		expect(resp.statusCode).toEqual(400);
	});
	test('no url query params reponds with 400', async () => {
		const resp = await request(app).get('/recipe');
		expect(resp.statusCode).toEqual(400);
	});
});
