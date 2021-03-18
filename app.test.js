const request = require('supertest');
const app = require('./app');

test('not found returns 404', async () => {
	const resp = await request(app).get('/does-not-exist');
	expect(resp.statusCode).toEqual(404);
});
