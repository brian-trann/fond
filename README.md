# Fond

>The culinary term fond, French for "base" or "foundation", refers to this sauce, although it is also sometimes used to describe the browned food bits instead (commonly in the United States). - [Wikipedia](https://en.wikipedia.org/wiki/Deglazing_(cooking))

---
Fond is a full stack recipe web app and web scraper built using NodeJS, React, PostgreSQL, and Express. It's goal is to make it easier to see recipe instructions and ingredients and to share recipes with oneself. Fond is also implemented for the command line, and is on the `command-line` branch. Web API is hosted on [Heroku](https://fond-backend.herokuapp.com/) Front End Repository: [GitHub](https://github.com/brian-trann/fond-frontend).

## Demo
[Fond](hard-verse.surge.sh) hosted on [Surge](https://surge.sh/)

## The problem I am trying to solve:
 I am trying to solve the inconvenient problem of needing to parse through a lengthy recipe website with modals blocking the ability to scroll. I especially find this inconvenient when I am at the grocery store and I need to make sure I have all of the ingredients, only to have to parse through the web page again because it reloaded on my phone… Only to have the recipe reload again when I go to cook it. I want an easy way to see the recipe instructions and ingredients without needing to repeatedly deal with these issues. 

Another slight quirk, with popular recipe websites is that there sometimes is a lengthy story behind how they came up with the recipe itself.

I just want a way to easily see the recipe, ingredients and instructions... The "fond" of the recipe page.

I understand why recipe sites need to do this. Companies need to generate money.

While this iteration does not solve my problem, I think that it will be a backbone for a future front end tool, or an extension that has the capability to send yourself the raw recipe text via email or to integrate a productivity tool like Trello or Asana.


## Approach
The API uses `Fond.scrapeFond(url)` which scrapes recipe data by targeting the `@Recipe` inside of ld+json scripts. It takes advantage of [Google's structured data guidelines for recipes](https://developers.google.com/search/docs/data-types/recipe). This iteration used [Bon Appetit](https://www.bonappetit.com/) and [Serious Eats](https://www.seriouseats.com/) as a target. **Update 5/5/2021:** Serious Eats rolled out a new website design that breaks the scraper.

## Considerations
The way that I implemented the scraping functionality is extremly specific, and it might not work for all recipe websites. This implementation takes advantage of the fact that recipe websites want to be seen on Google's search engine, and if websites are not using it, this will not work.

Another consideration is that the `@Recipe` spec might change.

## Preview
### Recipes Page
<img src='./assets/recipes-page-md.png' alt='Recipes Page Preview' width='700'>

### Recipe Page
<img src='./assets/recipe-page-md.png' alt='Recipe Page Preview' width='700'>

### Scraping Page
<img src='./assets/scrape-page-md.png' alt='Scrape Page Preview' width='700'>

# Stretch Goals:
- [ ] Implement Email Authorization / Confirmation
- [ ] Admin privileges to more easily view links that do not work. 
## Stretch Stretch Goals
* App integration for popular productivity apps like Trello, Notion, or Asana via the OAuth Framework
  * I think it would be great to automatically add cards to my kanban board that I use to keep track of recipes I like.

# Usage

### Endpoints:
* GET `/recipe` - Returns an array of recipes. Default limit: 20
  * { recipes : [ { id, url, raw_recipe, keywords, title } ] }
* GET `/recipe/id` - Returns { recipe }
* POST `/recipe/scrape` - URL needs to be in Request Body. Returns a recipe object || error
  * { url } => { response: {recipe : {} , success: BOOL }}
  * { url } => { response: {error : String , success: BOOL }}

### Example:
* URL used in example: [Bon Appetit Recipe Link](https://www.bonappetit.com/recipe/homemade-pappardelle)

#### POST `/recipe/scrape` endpoint: 
```json
  {
    "recipe": {
      "@context":"http://schema.org",
      "@type":"Recipe",
      "alternativeHeadline":"Homemade Pappardelle Recipe",
      "dateModified":"2020-12-04T22:46:11.278-05:00",
      "datePublished":"2010-01-24T19:00:00.000-05:00",
      "keywords":[
          "recipes",
          "party",
          "egg",
          "first course",
          "italian",
          "dinner",
          "pappardelle",
          "pasta",
          "web"
      ],
      "publisher":{
          "@context":"https://schema.org",
          "@type":"Organization",
          "name":"Bon Appétit",
          "logo":{
            "@type":"ImageObject",
            "url":"https://www.bonappetit.com/verso/static/bon-appetit/assets/logo-seo.328de564b950e3d5d1fbe3e42f065290ca1d3844.png",
            "width":"479px",
            "height":"100px"
          },
          "url":"https://www.bonappetit.com"
      },
      "isPartOf":{
          "@type":[
            "CreativeWork",
            "Product"
          ],
          "name":"Bon Appétit"
      },
      "isAccessibleForFree":true,
      "author":[
          {
            "@type":"Person",
            "name":"Kate Ewald",
            "sameAs":"https://www.bonappetit.com/contributor/kate-ewald"
          }
      ],
      "aggregateRating":{
          "@type":"AggregateRating",
          "ratingValue":3.13,
          "ratingCount":8
      },
      "description":"Homemade Pappardelle Recipe",
      "image":[
          "https://assets.bonappetit.com/photos/57e18f624caff61056fa83ab/master/w_484,h_344,c_limit/homemade_pappardelle_with_bolognese_sauce.jpg"
      ],
      "headline":"Homemade Pappardelle",
      "name":"Homemade Pappardelle",
      "recipeIngredient":[
          "5 cups all purpose flour, divided",
          "1 1/2 teaspoons salt, divided",
          "6 large eggs, divided",
          "6 large egg yolks, divided",
          "6 tablespoons (or more) water, divided"
      ],
      "recipeInstructions":[
          {
            "@type":"HowToStep",
            "text":"Place 2 1/2 cups flour and 3/4 teaspoon salt in processor; blend 5 seconds. Whisk 3 eggs, 3 yolks, and 3 tablespoons water in bowl. With machine running, pour egg mixture through feed tube. Blend until sticky dough forms, adding water by teaspoonfuls if dry."
          },
          {
            "@type":"HowToStep",
            "text":"Scrape dough out onto floured work surface. Knead dough until smooth and no longer sticky, sprinkling lightly with flour as needed if sticky, about 8 minutes. Shape into ball. Cover with plastic wrap and let rest 45 minutes. Repeat with remaining flour, salt, eggs, yolks, and water."
          },
          {
            "@type":"HowToStep",
            "text":"Divide each dough ball into 4 pieces. Cover dough with plastic wrap."
          },
          {
            "@type":"HowToStep",
            "text":"Set pasta machine to widest setting. Flatten 1 dough piece into 3-inch-wide rectangle. Run through machine 5 times, dusting lightly with flour if sticking. Continue to run piece through machine, adjusting to next-narrower setting after every 5 passes, until dough is about 26 inches long. Cut crosswise into 3 equal pieces. Run each piece through machine, adjusting to next-narrower setting, until strip is scant 1/16 inch thick and 14 to 16 inches long. Return machine to original setting for each piece. Arrange strips in single layer on sheets of parchment."
          },
          {
            "@type":"HowToStep",
            "text":"Repeat with remaining dough. Let strips stand until slightly dry to touch, 20 to 30 minutes. Fold strips in half so short ends meet, then fold in half again. Cut strips into 2/3-inch-wide pappardelle. DO AHEAD Can be made 1 day ahead. Arrange pappardelle in single layer on sheets of parchment. Stack sheets in roasting pan. Cover; chill."
          }
      ],
      "recipeYield":"makes 2 1/2 to 2 3/4 pounds Servings",
      "url":"https://www.bonappetit.com/recipe/homemade-pappardelle"
    }
}
```

# Stretch-Strech Goals


## Other Thoughts
I do not think that this needs to be a recipe manager. I think that people already have their own way that they like to keep track of things. Whether it be in Google Docs, Trello, Asana, Email, or even simply by printing things. I think that this tool can be like "middleware", similar to middleware in the context of Express. It just helps with a executing a task, and hopefully gives you the response (or recipe) that you are looking for.

## Node Version
v12.18.3