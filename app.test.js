const request = require('supertest');
const app = require('./app');
const db = require('./db');

test('not found returns 404', async function() {
	const resp = await request(app).get('/does-not-exist');
	expect(resp.statusCode).toEqual(404);
});

afterAll(function() {
	db.end();
});
