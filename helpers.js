const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { get } = require('./app');
const ExpressError = require('./expressError');
const testUrl = 'https://www.seriouseats.com/recipes/2013/11/sous-vide-deep-fried-turkey-porchetta-recipe.html';
const testUrl2 = 'https://www.bonappetit.com/recipe/grain-free-tahini-granola';

const parseNodes = (nodesArr) => {
	return nodesArr.map(([ child ]) => {
		return JSON.parse(child.data);
	});
};

/**
 * 
 * @param {Array} parsedNodes 
 * @return {Array}
 */
const filterRecipes = (parsedNodes) => {
	return parsedNodes.filter((node) => {
		return node['@type'] === 'Recipe';
	});
};
/**
 * 
 * @param {Array} recipe 
 * @return {{}|false}
 */
const checkRecipe = (recipeArr) => {
	if (recipeArr.length === 1) {
		const [ recipe ] = recipeArr;
		return recipe;
	} else {
		return false;
	}
};

const scrapeFond = async (link) => {
	try {
		const res = await axios.get(link);
		const $ = cheerio.load(res.data);
		const nodes = $(`script[type="application/ld+json"]`).toArray();
		const nodesArr = nodes.map((element) => element.children);
		const parsedNodes = parseNodes(nodesArr);
		const recipes = filterRecipes(parsedNodes);
		const recipe = checkRecipe(recipes);
		if (!recipe) throw ExpressError('More than one @type = Recipe was found');
		return recipe;
	} catch (error) {
		console.error(error);
	}
};

const fondToMD = (fond) => {
	const fileName = fond.name.split(' ').join('').replace(/[^\w\s]/gi, '');
	const resolvedPath = path.resolve(`${fileName}.md`);
	const text = formatFond(fond);
	fs.writeFile(resolvedPath, text, (error) => {
		if (error) {
			throw error;
		} else {
			console.log('success');
		}
	});
};
const formatFond = (fond) => {
	let str = '';
	str += '# ' + fond.name + '\n';
	str += '### ' + fond.description + '\n\n';
	str += '* Yield: ' + fond.recipeYield + '\n';
	// total time is not required in the schema
	// str += '* Total Time: ' + fond.totalTime + '\n\n';
	str += '## Ingredients ' + '\n';
	fond.recipeIngredient.forEach((ingredient) => {
		str += '* ' + ingredient + '\n';
	});
	str += '## Instructions' + '\n';
	fond.recipeInstructions.forEach((step, i) => {
		str += `${i + 1}. ` + step.text + '\n';
	});
	return str;
};
const handleError = (error) => console.error(error);
// // // // // // // // // // // //
// scrapeFond(testUrl).then((fond) => fondToMD(fond)).catch(handleError);
module.exports = { handleError, formatFond, fondToMD, scrapeFond, checkRecipe, filterRecipes, parseNodes };
