const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Add headers and preconnects
const targetHeaders = '<meta name="theme-color" content="#0a0a0a">';
const injectHeaders = `<meta name="theme-color" content="#0a0a0a">
    <!-- Security Headers -->
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <!-- Resource Hints & Preconnections -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://images.unsplash.com">
    <link rel="preconnect" href="https://api.github.com">
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    <link rel="dns-prefetch" href="https://images.unsplash.com">
    <link rel="dns-prefetch" href="https://api.github.com">
    <link rel="modulepreload" href="js/index.js">`;
html = html.replace(targetHeaders, injectHeaders);

// 2. Add rel="noopener noreferrer" to target="_blank" links
html = html.replace(/target="_blank"(?! rel="noopener noreferrer")/g, 'target="_blank" rel="noopener noreferrer"');

// 3. Add 'noopener,noreferrer' to window.open calls
html = html.replace(/window\.open\('([^']+)',\s*'_blank'\)/g, "window.open('$1', '_blank', 'noopener,noreferrer')");

fs.writeFileSync(indexPath, html);
console.log('Successfully patched index.html');
