const request = require('supertest');

const app = require('../app');
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll
} = require('./_testCommon');
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe('POST /auth/token', () => {
	test('should work', async () => {
		const resp = await request(app)
			.post('/auth/token')
			.send({ email: 'test1@test.com', password: 'testpassword1' });
		expect(resp.body).toEqual({
			token : expect.any(String)
		});
	});
	test('unauth with wrong pass', async () => {
		const resp = await request(app)
			.post('/auth/token')
			.send({ email: 'test1@test.com', password: 'this-is-wrong' });
		expect(resp.statusCode).toEqual(401);
	});
	test('bad request with no pass', async () => {
		const resp = await request(app).post('/auth/token').send({ email: 'test1@test.com' });
		expect(resp.statusCode).toEqual(400);
	});
	test('bad request with invalid data', async () => {
		const resp = await request(app).post('/auth/token').send({ email: 1, password: 'no' });
		expect(resp.statusCode).toEqual(400);
	});
});

describe('POST /auth/register', () => {
	test('should work for anon', async () => {
		const resp = await request(app)
			.post('/auth/register')
			.send({ email: 'test3@test.com', password: 'testpassword3', username: 'testuser3' });
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			token : expect.any(String)
		});
	});

	test('should not work for duplicate email', async () => {
		const resp = await request(app).post('/auth/register').send({
			email    : 'test1@test.com',
			password : 'this-should-not-work',
			username : 'shouldNotWorkAnyways'
		});
		expect(resp.statusCode).toEqual(400);
	});
	test('should not work for duplicate username', async () => {
		const resp = await request(app).post('/auth/register').send({
			email    : 'shouldNotWOrkAnyways@test.com',
			password : 'this-should-not-work',
			username : 'testuser2'
		});
		expect(resp.statusCode).toEqual(400);
	});
	test('should not work for missing fields', async () => {
		const resp = await request(app)
			.post('/auth/register')
			.send({ email: 'test3@test.com', password: 'testpassword3' });
		expect(resp.statusCode).toEqual(400);
	});
	test('should not work for invalid data', async () => {
		const resp = await request(app).post('/auth/register').send({
			email    : 'not-valid-email',
			password : 'shouldNotMatterAnyways',
			username : 'usernameDoesNotMatter'
		});
		expect(resp.statusCode).toEqual(400);
	});
});
