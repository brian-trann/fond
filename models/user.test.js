const { NotFoundError, BadRequestError, UnauthorizedError } = require('../expressError');
const db = require('../db');
const User = require('./user');
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

describe('authenticate', () => {
	test('should work', async () => {
		const user = await User.authenticate('test1@test.com', 'testpassword1');
		expect(user).toEqual({ username: 'testuser1', isConfirmed: false });
	});
	test('unauth if no user', async () => {
		try {
			await User.authenticate('test0@test.com', 'testpassword1');
			fail();
		} catch (error) {
			expect(error instanceof UnauthorizedError).toBeTruthy();
		}
	});
	test('unauth if wrong pass', async () => {
		try {
			await User.authenticate('test1@test.com', 'wrong-password');
			fail();
		} catch (error) {
			expect(error instanceof UnauthorizedError).toBeTruthy();
		}
	});
});

describe('register', () => {
	const newUser = { email: 'test4@test.com', username: 'testuser4', isConfirmed: false };
	test('should work', async () => {
		const user = await User.register({ ...newUser, password: 'testpassword4' });
		expect(user).toEqual(newUser);
		const found = await db.query("SELECT * FROM users WHERE username = 'testuser4'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].is_confirmed).toEqual(false);
		expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
	});

	test('bad request with duplicate data', async () => {
		try {
			await User.register({ ...newUser, password: 'testpassword4' });
			await User.register({ ...newUser, password: 'testpassword4' });
		} catch (error) {
			expect(error instanceof BadRequestError).toBeTruthy();
		}
	});
});
