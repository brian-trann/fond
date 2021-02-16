const [ url, fileType ] = process.argv.slice(2);
const Fond = require('./fond');

if (!url) throw 'Please provide a URL as first argument';

Fond.scrapeFond(url).then((fond) => Fond.fondToFile(fond, fileType)).catch((error) => console.error(error));
