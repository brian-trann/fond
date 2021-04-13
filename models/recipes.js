const db = require('../db');
const { NotFoundError } = require('../expressError');

class Recipe {
	/** Create a recipe (from data) */
	static async create({ url, rawRecipe, keywords, title }) {
		const res = await db.query(
			`INSERT INTO recipes
      (url, raw_recipe, keywords, title)
      VALUES ($1, $2, $3, $4)
      RETURNING url, raw_recipe AS "rawRecipe", keywords, title`,
			[ url, rawRecipe, keywords, title ]
		);
		const recipe = res.rows[0];
		return recipe;
	}

	static async getRecipes(limit, skip) {
		console.log('limit: ', limit);
		console.log('skip: ', skip);
		const res = await db.query(
			`SELECT id,
							url,
							raw_recipe,
							keywords,
							title
				FROM recipes
				ORDER BY keywords
				LIMIT $1
				OFFSET $2
			`,
			[ limit, skip ]
		);

		return res.rows;
	}
	static async get(id) {
		const recipeRes = await db.query(
			`SELECT id,
							url,
							raw_recipe,
							keywords,
							title
				FROM recipes
				WHERE id = $1`,
			[ id ]
		);
		const recipe = recipeRes.rows[0];

		if (!recipe) throw new NotFoundError(`No recipe with ID: ${id}`);

		return recipe;
	}
}
module.exports = Recipe;
