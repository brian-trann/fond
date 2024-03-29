const db = require('../db');
const User = require('../models/user');
const { generateEmailTokenAndDate } = require('../helpers/emailToken');
const { createToken } = require('../helpers/tokens');

const TEST_URL =
	'https://www.seriouseats.com/recipes/2013/11/sous-vide-deep-fried-turkey-porchetta-recipe.html';
const TEST_RECIPE_RESPONSE = {
	recipe : {
		'@context'         : 'http://schema.org/',
		'@type'            : 'Recipe',
		name               : 'Deep-Fried Sous Vide Turkey Porchetta (Turchetta) Recipe',
		datePublished      : '2013-11-13T12:35:00',
		dateModified       : '2019-12-05T16:45:15',
		description        :
			'Combine the precision of sous vide cooking with crispy deep-fried skin for the most show-stopping, satisfying Thanksgiving turkey ever.',
		image              : [
			'https://www.seriouseats.com/recipes/images/2016/11/20161114-sous-vide-turkey-porchetta-video-primary.jpg',
			'https://www.seriouseats.com/recipes/images/2016/11/20161114-sous-vide-turkey-porchetta-video-primary-1500x1125.jpg',
			'https://www.seriouseats.com/recipes/images/2016/11/20161114-sous-vide-turkey-porchetta-video-primary-750x563.jpg',
			'https://www.seriouseats.com/recipes/images/2016/11/20161114-sous-vide-turkey-porchetta-video-primary-300x225.jpg',
			'https://www.seriouseats.com/recipes/images/2016/11/20161114-sous-vide-turkey-porchetta-video-primary-625x469.jpg',
			'https://www.seriouseats.com/recipes/images/2016/11/20161114-sous-vide-turkey-porchetta-video-primary-200x150.jpg'
		],
		aggregateRating    : {
			'@type'     : 'AggregateRating',
			ratingValue : '4.7692307692308',
			ratingCount : '13'
		},
		recipeCategory     : [
			'Sous Vide',
			'Turkey',
			'Mains',
			'Christmas',
			'Deep Frying',
			'Fall',
			'Stovetop',
			'Thanksgiving',
			'Winter'
		],
		recipeYield        : 'Serves 5 to 6',
		totalTime          : 'PT11H30M',
		recipeIngredient   : [
			'1 recipe turkey porchetta, prepared through the end of step 7, skipping wrapping and refrigerating step at end of step 5',
			'1 1/2 quarts (1.4L) peanut or canola oil for deep-frying, or 2 tablespoons (30ml) canola oil for pan-frying',
			'Kosher salt'
		],
		recipeInstructions : [
			{
				'@type' : 'HowToStep',
				text    :
					'After forming and tying turkey porchetta (as described in step 5 of our turkey porchetta recipe), transfer to a sous vide–style vacuum-sealer bag. Seal tightly and let rest for at least 6 hours and up to 2 days.'
			},
			{
				'@type' : 'HowToStep',
				text    :
					'Preheat sous vide water bath to 140°F (60°C). Add turkey and cook for 4 to 5 hours. Remove and run under cool running water, or transfer to an ice bath to chill for 5 minutes. Remove from bag and add any congealed juices to gravy. Rinse turkey porchetta thoroughly and carefully pat dry with paper towels. Trim ends for a more cylindrical shape, if desired.'
			},
			{
				'@type' : 'HowToStep',
				text    :
					'To Finish by Deep-Frying: Heat 1 1/2 quarts (1.4L) peanut oil to 400°F (204°C) in a large wok or Dutch oven. Do not fill cooking vessel more than one-third of the way, in order to allow for bubbling and displacement when you add turkey. Carefully slide turkey into oil using spatulas and tongs (it will not be fully submerged). Immediately cover and cook, shaking pan occasionally, until sputtering dies a bit, about 2 minutes. Adjust flame to maintain a consistent 350°F (177°C) temperature. Using a large metal ladle, continuously spoon hot oil over exposed portions of roast until bottom half is cooked and crisp, about 5 minutes. Carefully flip and cook on second side, basting the whole time. Proceed to step 5.'
			},
			{
				'@type' : 'HowToStep',
				text    :
					'To Finish by Pan-Roasting: While wearing an apron (the turkey can splatter), heat 2 tablespoons (30ml) canola oil in a large stainless steel or cast iron skillet over high heat until gently smoking. Add turkey and cook, turning occasionally, until well browned on all sides, about 10 minutes total.'
			},
			{
				'@type' : 'HowToStep',
				text    :
					'Remove turchetta to a large paper towel–lined plate and blot all over. Season with salt. Let rest 5 minutes. Carve and serve with gravy on the side.'
			}
		],
		author             : {
			'@type'     : 'Person',
			name        : 'J. Kenji López-Alt',
			jobTitle    : 'Chief Culinary Advisor',
			sameAs      : [
				'https://www.facebook.com/kenjilopezalt/',
				'https://www.twitter.com/@kenjilopezalt'
			],
			description :
				"J. Kenji López-Alt is a stay-at-home dad who moonlights as the Chief Culinary Consultant of Serious Eats and the Chef/Partner of Wursthall, a German-inspired California beer hall near his home in San Mateo. His first book,  The Food Lab: Better Home Cooking Through Science (based on his Serious Eats column of the same name) is a New York Times best-seller, recipient of a James Beard Award, and was named Cookbook of the Year in 2015 by the International Association of Culinary Professionals. Kenji's next project is a children’s book called Every Night is Pizza Night, to be released in 2020, followed by another big cookbook in 2021.",
			url         : 'https://www.seriouseats.com/user/profile/kenjilopezalt'
		},
		keywords           :
			'deep-fried, holiday, low carb, porchetta, thanksgiving, turchetta, turkey'
	}
};
const commonBeforeAll = async () => {
	const testUser1 = generateEmailTokenAndDate();
	const emailToken1 = testUser1.emailToken;
	const tokenExpiration1 = testUser1.tokenExpiration;
	const testUser2 = generateEmailTokenAndDate();
	const emailToken2 = testUser2.emailToken;
	const tokenExpiration2 = testUser2.tokenExpiration;
	await db.query("DELETE FROM users WHERE email = 'test1@test.com'");
	await db.query("DELETE FROM users WHERE email = 'test2@test.com'");
	await User.register({
		email           : 'test1@test.com',
		password        : 'testpassword1',
		username        : 'testuser1',
		isConfirmed     : false,
		emailToken      : emailToken1,
		tokenExpiration : tokenExpiration1
	});
	await User.register({
		email           : 'test2@test.com',
		password        : 'testpassword2',
		username        : 'testuser2',
		isConfirmed     : false,
		emailToken      : emailToken2,
		tokenExpiration : tokenExpiration2
	});
};

const commonBeforeEach = async () => {
	await db.query('BEGIN');
};

const commonAfterEach = async () => {
	await db.query('ROLLBACK');
};

const commonAfterAll = async () => {
	await db.end();
};

const user1Token = createToken({ username: 'testuser1', isConfirmed: false });
const user2Token = createToken({ username: 'testuser2', isConfirmed: false });
module.exports = {
	TEST_URL,
	TEST_RECIPE_RESPONSE,
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	user1Token,
	user2Token
};
