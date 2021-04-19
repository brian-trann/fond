const cheerio = require('cheerio');
const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
const { BadRequestError } = require('./expressError');
/**
 * Fond requires cheerio, axios, fs, and path
 * 
 * TODO: 
 * - refactor and separate out command line & Express.js functionality
 * - instead of .fondToFile usage of Regex, consider using slugify library
 */
class Fond {
	// this class requires cheerio, axios
	/**
	 * parseNodes is a helper method for .scrapeFond()
	 * - should not need to be used by itself
	 * @param {*} nodesArr 
	 * @returns 
	 */
	static parseNodes(nodesArr) {
		return nodesArr.map(([ child ]) => {
			return JSON.parse(child.data);
		});
	}

	/**
     * filterRecipes is a helper method for .scrapeFond()
		 * - should not need to be used by itself
     * @param {Array} parsedNodes 
     * @return {Array}
     */
	static filterRecipes = (parsedNodes) => {
		return parsedNodes.filter((node) => {
			return node['@type'] === 'Recipe';
		});
	};

	/**
   * checkRecipe is a helper method for .scrapeFond()
	 * - should not need to be used by itself
   * @param {Array} recipe 
   * @return {{}|false}
   */
	static checkRecipe = (recipeArr) => {
		if (recipeArr.length === 1) {
			const [ recipe ] = recipeArr;
			return recipe;
		} else {
			return false;
		}
	};

	/**
	 * DISABLED TO REDUCE DEPENDENCIES
	 * 
	 * .fondToFile() was impleneted for command line file generation
	 * 
   * default filetype is md.
   * If a filetype is passed in, that is not 'txt'
   * @param {*} fond 
   * @param {String|null} fileType 
   */
	// static fondToFile = (fond, fileType) => {
	// 	const type = fileType || 'md';
	// 	if (type === 'txt' || type === 'md') {
	// 		const fileName = fond.name.replace(/\s/g, '').replace(/[^\w\s]/gi, '');
	// 		const resolvedPath = path.resolve(`${fileName}.${type}`);
	// 		let text = null;
	// 		if (type === 'md') {
	// 			text = Fond.formatFondMd(fond);
	// 		} else {
	// 			text = Fond.formatFondText(fond);
	// 		}
	// 		fs.writeFile(resolvedPath, text, (error) => {
	// 			if (error) {
	// 				throw new Error();
	// 			} else {
	// 				console.log('success');
	// 			}
	// 		});
	// 	} else {
	// 		throw 'not valid filetype';
	// 	}
	// };

	/**
	 * formatFondMd - DEPRECATED
	 *  - This is a less dynamic method than .formatFond()
	 *  - Returns a string
	 * 
	 * Use .formatFond() instead.
	 */
	static formatFondMd = (fond) => {
		const makeRecipeHeader = (fond) => {
			const { description, name, recipeYield } = fond;
			let header = `# ${name} \n ## ${description} \n * Yield: ${recipeYield} \n`;
			if (fond.totalTime) {
				header += `* Total Time: ${fond.totalTime}\n`;
			}
			return header;
		};
		const makeIngredients = (fond) => {
			let ingredients = '## Ingredients \n';
			fond.recipeIngredient.forEach((ingredient) => {
				ingredients += '* ' + ingredient + '\n';
			});
			return ingredients;
		};
		const makeInstructions = (fond) => {
			let instructions = '## Instructions \n';
			fond.recipeInstructions.forEach((step, i) => {
				instructions += `${i + 1}. ` + step.text + '\n';
			});
			return instructions;
		};
		const header = makeRecipeHeader(fond);
		const ingredients = makeIngredients(fond);
		const instructions = makeInstructions(fond);
		return [ header, ingredients, instructions ].join('\n');
	};

	/**
	 * formatFondText - DEPRECATED
	 *  - This is a less dynamic method than .formatFond()
	 *  - Returns a string
	 * 
	 * Use .formatFond() instead
	 */
	static formatFondText = (fond) => {
		const makeRecipeHeader = (fond) => {
			const { description, name, recipeYield } = fond;
			let header = `${name} \n${description} \nYield: ${recipeYield} \n`;
			if (fond.totalTime) {
				header += `Total Time: ${fond.totalTime}\n`;
			}
			return header;
		};
		const makeIngredients = (fond) => {
			let ingredients = 'Ingredients \n';
			fond.recipeIngredient.forEach((ingredient) => {
				ingredients += '* ' + ingredient + '\n';
			});
			return ingredients;
		};
		const makeInstructions = (fond) => {
			let instructions = 'Instructions \n';
			fond.recipeInstructions.forEach((step, i) => {
				instructions += `${i + 1}. ` + step.text + '\n';
			});
			return instructions;
		};
		const header = makeRecipeHeader(fond);
		const ingredients = makeIngredients(fond);
		const instructions = makeInstructions(fond);
		return [ header, ingredients, instructions ].join('\n');
	};

	/**
	 * formatFond
	 *  - a versitle method that returns an object containing 
	 * 			formatted markdown and text markup
	 *  - user can concatenate the properties they wish to use
	 * @param {Object} fond 
	 * @returns {} { 
	 * 								markdown : { header, ingredients, instructions } , 
	 * 								text : { header, ingredients, instructions }
	 * 						}
	 */
	static formatFond = (fond) => {
		const fondResponse = { text: {}, markdown: {} };

		const makeRecipeHeader = (fond) => {
			const { description, name, recipeYield } = fond;
			fondResponse.text.header = `${name} \n${description} \nYield: ${recipeYield} \n`;
			fondResponse.markdown.header = `# ${name} \n ## ${description} \n * Yield: ${recipeYield} \n`;
			if (fond.totalTime) {
				fondResponse.text.header += `Total Time: ${fond.totalTime}\n`;
				fondResponse.markdown.header += `* Total Time: ${fond.totalTime}\n`;
			}
		};
		const makeIngredients = (fond) => {
			fondResponse.text.ingredients = 'Ingredients \n';
			fondResponse.markdown.ingredients = '## Ingredients \n';

			fond.recipeIngredient.forEach((ingredient) => {
				fondResponse.text.ingredients += '* ' + ingredient + '\n';
				fondResponse.markdown.ingredients += '* ' + ingredient + '\n';
			});
		};
		const makeInstructions = (fond) => {
			fondResponse.text.instructions = 'Instructions \n';
			fondResponse.markdown.instructions = '## Instructions \n';

			fond.recipeInstructions.forEach((step, i) => {
				fondResponse.text.instructions += `${i + 1}. ` + step.text + '\n';
				fondResponse.markdown.instructions += `${i + 1}. ` + step.text + '\n';
			});
		};
		makeRecipeHeader(fond);
		makeIngredients(fond);
		makeInstructions(fond);

		return fondResponse;
	};
	/**
	 * handleError - DEPRECATED
	 * - was used as a general error handler used as a command line tool
	 * @param {*} error 
	 * @returns 
	 */
	static handleError = (error) => console.error(error);

	/**
   * scrapeFond()
	 *  - main method to scrape a given URL
   * @param {String} link 
   * @returns Promise, that will resolve to an Object, will throw error
   */
	static async scrapeFond(link) {
		try {
			const res = await axios.get(link);

			const $ = cheerio.load(res.data);

			const nodes = $(`script[type="application/ld+json"]`).toArray();
			const nodesArr = nodes.map((element) => element.children);
			const parsedNodes = Fond.parseNodes(nodesArr);
			const recipes = Fond.filterRecipes(parsedNodes);
			const recipe = Fond.checkRecipe(recipes);
			if (!recipe) {
				throw new BadRequestError('Unable to parse script[type="application/ld+json"]');
			} else {
				recipe.url = link;

				if (!recipe.keywords) {
					recipe.keywords = '';
				}

				// Some recipes will be formatted as an array
				// The Google Spec recommends keywords to be a comma
				// separated string

				if (Array.isArray(recipe.keywords)) {
					const keywords = recipe.keywords.join(', ');
					recipe.keywords = keywords;
				}

				return { recipe, success: true };
			}
		} catch (error) {
			if (!error.response) {
				error.response = { status: 400 };
			}

			const status = error.response.status;
			return { error: error.message, success: false, status };
		}
	}
}

module.exports = Fond;
