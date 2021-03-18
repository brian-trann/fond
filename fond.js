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
	// this class requires cheerio, axios, fs, and path

	static parseNodes(nodesArr) {
		return nodesArr.map(([ child ]) => {
			return JSON.parse(child.data);
		});
	}

	/**
     * 
     * @param {Array} parsedNodes 
     * @return {Array}
     */
	static filterRecipes = (parsedNodes) => {
		return parsedNodes.filter((node) => {
			return node['@type'] === 'Recipe';
		});
	};

	/**
   * 
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

	static handleError = (error) => console.error(error);

	/**
   * Scrape a link
   * @param {String} link 
   * @returns Promise, that will resolve to an Object, will throw error
   */
	static async scrapeFond(link) {
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
			return recipe;
		}
	}
}

module.exports = Fond;
