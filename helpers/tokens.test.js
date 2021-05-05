const jwt = require('jsonwebtoken');
const { createToken } = require('./tokens');
const { SECRET_KEY } = require('../config');

describe('createToken', () => {
	test('should work: not confirmed', () => {
		const token = createToken({ username: 'test', isConfirmed: false });
		const payload = jwt.verify(token, SECRET_KEY);
		expect(payload).toEqual({
			iat         : expect.any(Number),
			user        : 'test',
			isConfirmed : false
		});
	});
	test('should work: confirmed', () => {
		const token = createToken({ username: 'test', isConfirmed: true });
		const payload = jwt.verify(token, SECRET_KEY);
		expect(payload).toEqual({
			iat         : expect.any(Number),
			user        : 'test',
			isConfirmed : true
		});
	});
	test('should work: default, not confirmed', () => {
		const token = createToken({ username: 'test' });
		const payload = jwt.verify(token, SECRET_KEY);
		expect(payload).toEqual({
			iat         : expect.any(Number),
			user        : 'test',
			isConfirmed : false
		});
	});
});
