# Fond
Fond is a web scraping tool for recipes, by targeting the `@Recipe` inside of ld+json scripts. This project has a few endpoints to return a JSON object based off of a recipe site. Also there are endpoints to generate plain text.

# Node Version
v12.18.3

# Command Line usage
* File output location is currently set to the root directory of this project.
* File Name is the title of the recipe
  
To create a markdown file:
```bash
npm run fond -- 'http://seriouseats...'
```
To create a txt file, include `'txt'` as second argument:
```bash
npm run fond -- 'http://seriouseats...' 'txt'
```


# Usage

`.scrapeFond()` method returns a promise that resolves into an object representing the recipe.

`.fondToFile()` is a function that will make a text or markdown file, depending on the second argument. Default file output is a markdown file.
```javascript
Fond.scrapeFond(testUrl).then((fond) => Fond.fondToFile(fond)).catch((error)=> Fond.handleError(error))
```

# Notes / To Do

* Maybe clean up fond.js
* add jsonschema for URL validation
* Write tests

# Future
I would like to make this into a more robust tool / recipe manager. Stretch goal: App integration for popular productivity apps like Trello.
