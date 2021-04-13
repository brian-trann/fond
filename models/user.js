const db = require('../db');
const bcrypt = require('bcrypt');

const { NotFoundError, BadRequestError, UnauthorizedError } = require('../expressError');

const { BCRYPT_WORK_FACTOR } = require('../config.js');

/** Related functions for users */

class User {
	/** authenticate user with username and password
   * 
   * returns { username, email , isConfirmed}
   * 
   * throws UnauthorizedError if user not found
   *  or wrong password
   */
	static async authenticate(email, password) {
		const res = await db.query(
			`SELECT username,
              password,
              is_confirmed AS "isConfirmed"
        FROM users
        WHERE email = $1`,
			[ email ]
		);

		const user = res.rows[0];

		if (user) {
			// compare hashed password to a new hash from password
			const isValid = await bcrypt.compare(password, user.password);
			if (isValid === true) {
				delete user.password;
				return user;
			}
		}

		throw new UnauthorizedError('Invalid username/password');
	}
	/** Register with data
   * 
   * Returns { username, email, isConfirmed}
   * 
   * Throws BadRequestError on duplicates
   */
	static async register({ email, password, username, isConfirmed, emailToken, tokenExpiration }) {
		const duplicateCheck = await db.query(
			`SELECT email 
      FROM users 
      WHERE email = $1`,
			[ email ]
		);

		if (duplicateCheck.rows[0]) {
			throw new BadRequestError(`Duplicate username: ${email}`);
		}

		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

		const res = await db.query(
			`INSERT INTO users
		  ( username,
		    email,
		    password,
		    is_confirmed,
				email_token,
				token_expiration)
		   VALUES ($1, $2, $3, $4, $5, $6)
		   RETURNING username, email, is_confirmed AS "isConfirmed"`,
			[ username, email, hashedPassword, isConfirmed, emailToken, tokenExpiration ]
		);
		console.log(username, email, isConfirmed);
		console.log('emailToken: ', emailToken);
		console.log('tokenExpiration: ', tokenExpiration);
		const user = res.rows[0];

		return user;
	}

	/** Given an email, return data about user
   * 
   * Returns { username, email, is_confirmed, recipes }
   *  Where recipes is { id, url, raw_recipe, keywords, title}
   * 
   * Throws NotFoundError if user not found
   */
	static async get(username) {
		const userRes = await db.query(
			`SELECT username,
              email,
              is_confirmed
        FROM users
        WHERE username = $1`,
			[ username ]
		);

		const user = userRes.rows[0];

		if (!user) throw new NotFoundError(`No username: ${username}`);

		const userRecipesRes = await db.query(
			`SELECT r.recipe_id
      FROM user_recipes AS r
      WHERE r.email = $1`,
			[ username ]
		);

		user.recipes = userRecipesRes.rows.map((r) => r.recipe_id);
		return user;
	}
	/** Delete user from database; returns undefined */
	static async remove(username) {
		const res = await db.query(
			`DELETE
      FROM users
      WHERE username = $1
      RETURNING username`,
			[ username ]
		);

		const user = res.rows[0];
		if (!user) throw new NotFoundError(`No username: ${username}`);
	}
	/**
	 * Like a Recipe: update DB, returns undefined
	 * 
	 * -username
	 * -recipeId
	 * 
	 */
	static async likeRecipe(username, recipeId) {
		const preCheck = await db.query(
			`SELECT id 
			 FROM recipes
			 WHERE id = $1`,
			[ recipeId ]
		);
		const recipe = preCheck.rows[0];
		if (!recipe) throw new NotFoundError(`No recipe: ${recipeId}`);

		const preCheck2 = await db.query(
			`SELECT username
			 FROM users
			 WHERE username = $1`,
			[ username ]
		);
		const user = preCheck2.rows[0];
		if (!user) throw new NotFoundError(`No username: ${username}`);

		await db.query(
			`INSERT INTO user_recipes (username, recipe_id)
			 VALUES ($1, $2)`,
			[ username, recipeId ]
		);
	}
}

module.exports = User;
