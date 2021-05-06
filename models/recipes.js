const db = require('../db');
const { NotFoundError, BadRequestError } = require('../expressError');
const Fond = require('../fond');

/**
 * Recipe class:
 * 
 * - createFromUrl : Tries to create a recipe, given a url
 * 
 * - getRecipes : Gets recipes from DB
 * 
 * - get : Get recipe by id
 * 
 * - _failedScrape : (private) Insert failed URL to failed_recipes
 */
class Recipe {
	/**
	 * createFromUrl - tries to create a recipe given URL.
	 * 
	 * If parsed correctly: Creates a recipe in the db
	 * 
	 * If 404: Throws error
	 * 
	 * If incorrectly parsed: calls Recipe._failedScrape
	 *  (inserts into failed_recipes)
	 * 	
	 * @param {*} url - given URL 
	 * @returns Recipe
	 */
	static async createFromUrl(url) {
		// NOT READY --
		// Still need to PRECHECK if URL already in DB.

		const duplicateRecipeCheck = await db.query(
			`SELECT id,
							url,
							raw_recipe,
							keywords,
							title
				FROM recipes
				WHERE url = $1`,
			[ url ]
		);

		if (duplicateRecipeCheck.rows[0]) {
			console.log('got a dupe');
			const recipe = duplicateRecipeCheck.rows[0];
			return recipe;
		}

		const failedRecipeCheck = await db.query(
			`SELECT url FROM failed_recipes
				WHERE url = $1`,
			[ url ]
		);

		if (failedRecipeCheck.rows[0]) {
			// URL is already in the failed_recipes table
			console.log('failed duplicate');
			throw new BadRequestError('Something went wrong! URL sent to the dev!');
		}

		const res = await Fond.scrapeFond(url);

		if (res.status === 404) throw new BadRequestError('Please check URL');

		if (res.success) {
			const recipeForDb = res.recipe;
			const rawRecipe = JSON.stringify(recipeForDb);

			const recipeRes = await db.query(
				`INSERT INTO recipes
						(url, raw_recipe, keywords, title)
						VALUES ($1, $2, $3, $4)
						RETURNING id, url, raw_recipe, keywords, title`,
				[ url, rawRecipe, recipeForDb.keywords, recipeForDb.name ]
			);
			const recipe = recipeRes.rows[0];
			console.log('SCRAPED - RECIPE ID:', recipe.id);
			return recipe;
		} else {
			await Recipe._failedScrape(url);
			console.log('new failed');
			// Future self: Do I make a custom error?
			throw new BadRequestError('Something went wrong! URL sent to the dev!');
		}
	}

	/** Find all recipes (optional filter on search).
   * 
   * - limit - number of rows to return
   * - skip - number of rows to skip/offset
   * - search - optional search -> search by title
   *
   * Returns [{ id, url, raw_recipe, keywords, title }, ...]
   * */

	static async getRecipes(limit = 20, skip, search) {
		const queryValues = [];
		const whereExpressions = [];
		let query = `SELECT id,
											url,
											raw_recipe,
											keywords,
											title
									FROM recipes
								`;

		// For each possible search term, add to whereExpressions
		// 		and queryValues so we can generate the right SQL
		if (search) {
			const searchParamsArr = search.split(' ');
			searchParamsArr.forEach((param) => {
				//Below: SQL for searching using ILIKE
				// queryValues.push(`%${param}%`);
				// whereExpressions.push(`title ILIKE $${queryValues.length}`);

				// Testing POSIX (regular expression)
				queryValues.push(`${param}`);
				whereExpressions.push(`title ~* $${queryValues.length}`);
			});
		}
		if (whereExpressions.length > 0) {
			query += ' WHERE ' + whereExpressions.join(' AND ');
		}

		// Finalize the query and returning results
		query += ' ORDER BY keywords ';
		queryValues.push(limit);
		query += ` LIMIT $${queryValues.length}`;
		queryValues.push(skip);
		query += ` OFFSET $${queryValues.length}`;

		const res = await db.query(query, queryValues);

		return res.rows;
	}
	/**
	 * Get a recipe by ID
	 * 
	 * Returns { id, url, raw_recipe, keywords, title }
	 */
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
	/** Create failed recipe, given a URL
	 * (private)
	*/
	static async _failedScrape(url) {
		// await db.query(
		// 	`INSERT INTO failed_recipes (url)
		// 		VALUES ($1)
		// 		RETURNING id, url`,
		// 	[ url ]
		// );

		return;
	}
}
module.exports = Recipe;
