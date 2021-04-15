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

				// Should I make a query to join the recipes on the user
				return user;
			}
		}

		throw new UnauthorizedError('Invalid email/password');
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
			throw new BadRequestError('Email already in use.');
		}

		const duplicateUsernameCheck = await db.query(
			`SELECT username
				FROM users
				WHERE username = $1`,
			[ username ]
		);
		if (duplicateUsernameCheck.rows[0]) {
			throw new BadRequestError('Username already in use');
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

		const user = res.rows[0];

		return user;
	}

	/** Given a username, return data about user
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
              is_confirmed AS "isConfirmed"
        FROM users
        WHERE username = $1`,
			[ username ]
		);

		const user = userRes.rows[0];

		if (!user) throw new NotFoundError(`No username: ${username}`);

		const userRecipesRes = await db.query(
			`SELECT recipes.id,
							recipes.url,
							recipes.raw_recipe,
							recipes.keywords,
							recipes.title
				FROM recipes
				JOIN  user_recipes ON user_recipes.recipe_id = recipes.id
				WHERE user_recipes.email = $1`,
			[ user.email ]
		);

		user.recipes = userRecipesRes.rows.map((r) => r);
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
	 * Like a Recipe: update DB, returns recipe
	 * 
	 * -username
	 * -recipeId
	 * 
	 */
	static async likeRecipe(username, recipeId) {
		const preCheck = await db.query(
			`SELECT id,
							url,
							raw_recipe,
							keywords,
							title
			 FROM recipes
			 WHERE id = $1`,
			[ recipeId ]
		);
		const recipe = preCheck.rows[0];
		if (!recipe) throw new NotFoundError(`No recipe: ${recipeId}`);

		const preCheck2 = await db.query(
			`SELECT email,
							username
			 FROM users
			 WHERE username = $1`,
			[ username ]
		);
		const user = preCheck2.rows[0];

		if (!user) throw new NotFoundError(`No username: ${username}`);

		await db.query(
			`INSERT INTO user_recipes (email, recipe_id)
			 VALUES ($1, $2)`,
			[ user.email, recipeId ]
		);
		return recipe;
	}
	/**
	 * A User unlikes a recipe: update DB, returns undefined
	 */
	static async unlikeRecipe(username, recipeId) {
		const userCheck = await db.query(
			`SELECT email,
							username
			FROM users
			WHERE username = $1`,
			[ username ]
		);
		const user = userCheck.rows[0];
		if (!user) throw new NotFoundError(`No username: ${username}`);

		await db.query(
			`DELETE 
				FROM user_recipes
				WHERE recipe_id = $1
				AND email = $2`,
			[ recipeId, user.email ]
		);
	}
}

module.exports = User;
