const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../expressError');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require('./auth');

const { SECRET_KEY } = require('../config');
const testJwt = jwt.sign({ user: 'test', isConfirmed: false }, SECRET_KEY);
const badJwt = jwt.sign({ user: 'test', isConfirmed: false }, 'not-a-key');

describe('authenticateJWT', () => {
	test('should work via header', () => {
		expect.assertions(2);
		const req = { headers: { authorization: `Bearer ${testJwt}` } };
		const res = { locals: {} };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		authenticateJWT(req, res, next);
		expect(res.locals).toEqual({
			user : {
				iat         : expect.any(Number),
				user        : 'test',
				isConfirmed : false
			}
		});
	});

	test('should work with no header', () => {
		expect.assertions(2);
		const req = {};
		const res = { locals: {} };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		authenticateJWT(req, res, next);
		expect(res.locals).toEqual({});
	});

	test('should work with invalid token', () => {
		expect.assertions(2);
		const req = { headers: { authorization: `Bearer ${badJwt}` } };
		const res = { locals: {} };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		authenticateJWT(req, res, next);
		expect(res.locals).toEqual({});
	});
});
describe('ensureLoggedIn', () => {
	test('should work', () => {
		expect.assertions(1);
		const req = {};
		const res = { locals: { user: { user: 'test', isConfirmed: false } } };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		ensureLoggedIn(req, res, next);
	});
	test('should work if unauth', () => {
		expect.assertions(1);
		const req = {};
		const res = { locals: {} };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureLoggedIn(req, res, next);
	});
});
describe('ensureCorrectUser', () => {
	test('should work for same user', () => {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: { user: { user: 'test', isConfirmed: false } } };
		const next = function(err) {
			expect(err).toBeFalsy();
		};
		ensureCorrectUser(req, res, next);
	});
	test('should not work for unauth', () => {
		expect.assertions(1);
		const req = { params: { username: 'wrong' } };
		const res = { locals: { user: { user: 'test', isConfirmed: false } } };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureCorrectUser(req, res, next);
	});
	test('should not work for anon', () => {
		expect.assertions(1);
		const req = { params: { username: 'test' } };
		const res = { locals: {} };
		const next = function(err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureCorrectUser(req, res, next);
	});
});
