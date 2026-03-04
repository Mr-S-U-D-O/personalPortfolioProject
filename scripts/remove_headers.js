const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../index.html');
let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace(/\s*<!-- Security Headers -->/g, '');
html = html.replace(/\s*<meta http-equiv="X-XSS-Protection" content="1; mode=block">/g, '');
html = html.replace(/\s*<meta http-equiv="X-Content-Type-Options" content="nosniff">/g, '');
html = html.replace(/\s*<link rel="modulepreload" href="js\/index.js">/g, '');

fs.writeFileSync(indexPath, html);
console.log('Removed security headers and modulepreload from index.html');
