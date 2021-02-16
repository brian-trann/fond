const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// const testUrl = 'https://www.seriouseats.com/recipes/2013/11/sous-vide-deep-fried-turkey-porchetta-recipe.html';
// const testUrl2 = 'https://www.bonappetit.com/recipe/grain-free-tahini-granola';
// const testUrl3 = 'https://www.seriouseats.com/recipes/2017/02/detroit-style-pizza-recipe.html';
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
	static fondToFile = (fond, fileType) => {
		const type = fileType || 'md';
		if (type === 'txt' || type === 'md') {
			const fileName = fond.name.split(' ').join('').replace(/[^\w\s]/gi, '');
			const resolvedPath = path.resolve(`${fileName}.${type}`);
			let text = null;
			if (type === 'md') {
				text = Fond.formatFondMd(fond);
			} else {
				text = Fond.formatFondText(fond);
			}
			fs.writeFile(resolvedPath, text, (error) => {
				if (error) {
					throw error;
				} else {
					console.log('success');
				}
			});
		} else {
			throw 'not valid filetype';
		}
	};
	static formatFondMd = (fond) => {
		let str = '';
		str += '# ' + fond.name + '\n';
		str += '### ' + fond.description + '\n';
		str += '* Yield: ' + fond.recipeYield + '\n\n';
		// total time is not required in the schema
		// str += '* Total Time: ' + fond.totalTime + '\n\n';
		str += '## Ingredients ' + '\n\n';
		fond.recipeIngredient.forEach((ingredient) => {
			str += '* ' + ingredient + '\n';
		});
		str += '\n\n## Instructions' + '\n';
		fond.recipeInstructions.forEach((step, i) => {
			str += `${i + 1}. ` + step.text + '\n';
		});
		return str;
	};

	static formatFondText = (fond) => {
		let str = '';
		str += fond.name + '\n\n';
		str += fond.description + '\n';
		str += 'Yield: ' + fond.recipeYield + '\n\n';
		// total time is not required in the schema
		// str += '* Total Time: ' + fond.totalTime + '\n\n';
		str += 'Ingredients ' + '\n\n';
		fond.recipeIngredient.forEach((ingredient) => {
			str += '* ' + ingredient + '\n';
		});
		str += '\nInstructions' + '\n';
		fond.recipeInstructions.forEach((step, i) => {
			str += `${i + 1}. ` + step.text + '\n';
		});
		return str;
	};

	handleError = (error) => console.error(error);

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
			throw 'Error: No ld+json:@Recipe or more than one';
		} else {
			return recipe;
		}
	}
}
// Fond.scrapeFond(testUrl3).then((fond) => Fond.fondToFile(fond)).catch(Fond.handleError); // markdown
module.exports = Fond;
