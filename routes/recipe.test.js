const Fond = require('../fond');
const request = require('supertest');
const app = require('../app');

const {
	TEST_RECIPE_RESPONSE,
	TEST_URL,
	commonAfterAll,
	commonAfterEach,
	commonBeforeEach
} = require('./_testCommon');

beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('POST /recipe/scrape', () => {
	const endpoint = '/recipe/scrape';
	test('works', async () => {
		Fond.scrapeFond = jest.fn(async () => Promise.resolve(TEST_RECIPE_RESPONSE));
		const resp = await request(app).post(endpoint).send({ url: TEST_URL });
		expect(resp.statusCode).toEqual(201);
	});
	test('empty url query param reponds with 400', async () => {
		const resp = await request(app).post(endpoint).send({ url: '' });
		expect(resp.statusCode).toEqual(400);
	});
	test('bad url query param reponds with 400', async () => {
		const resp = await request(app).post(endpoint).send({ url: 'not a url' });
		expect(resp.statusCode).toEqual(400);
	});
	test('no url query params reponds with 400', async () => {
		const resp = await request(app).post(endpoint);
		expect(resp.statusCode).toEqual(400);
	});
});

describe('GET /recipe', () => {
	const endpoint = '/recipe';
	const DEFAULT_RECIPE_ARRAY_SIZE = 15;
	const DIFFERENT_LIMIT_PARAM = 20;

	test('should work for anon', async () => {
		const resp = await request(app).get(endpoint);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.recipes.length).toEqual(DEFAULT_RECIPE_ARRAY_SIZE);
	});

	test('should work with different LIMIT param', async () => {
		const resp = await request(app).get(endpoint).query({ limit: DIFFERENT_LIMIT_PARAM });
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.recipes.length).toEqual(DIFFERENT_LIMIT_PARAM);
	});
	test('should work with a search param', async () => {
		const resp = await request(app).get(endpoint).query({ search: 'fried' });
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.recipes.length).toEqual(DEFAULT_RECIPE_ARRAY_SIZE);
	});
});
describe('GET /recipe/:id', () => {
	const endpoint = '/recipe/1';
	const invalid = '/recipe/0';
	test('should work with valid recipe id', async () => {
		const resp = await request(app).get(endpoint);
		expect(resp.statusCode).toEqual(200);
		expect(resp.body.recipe.id).toEqual(1);
	});
	test('should 404 with invalid recipe id', async () => {
		const resp = await request(app).get(invalid);
		expect(resp.statusCode).toEqual(404);
	});
});
