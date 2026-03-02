const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://yourportfolio.com'; // Adjust this when deploying
const ROOT_DIR = path.join(__dirname, '../');
const DATA_PATH = path.join(__dirname, '../data/blog.json');
const INDEX_PATH = path.join(__dirname, '../index.html');
const TEMPLATE_PATH = path.join(__dirname, 'blog-template.html');
const SITEMAP_XML_PATH = path.join(__dirname, '../sitemap.xml');
const SITEMAP_HTML_PATH = path.join(__dirname, '../sitemap.html');

console.log('Starting unified build process...');

// Track all generated pages for the sitemap
const sitePages = ['index.html'];

// 1. Read Data
let blogData = [];
try {
    const rawData = fs.readFileSync(DATA_PATH, 'utf8');
    blogData = JSON.parse(rawData);
    console.log(`Loaded ${blogData.length} blog posts from data/blog.json`);
} catch (err) {
    console.error('Error reading data/blog.json:', err);
    process.exit(1);
}

// 2. Generate Grid Cards HTML for Index
let cardsHTML = '\n';
blogData.forEach((post, index) => {
    // Format index as '01', '02', etc.
    const ghostNumber = (index + 1).toString().padStart(2, '0');
    
    cardsHTML += `
            <div class="blog-gallery-item">
                <div class="blog-gallery-image-wrapper">
                    ${post.image ? `<img src="${post.image}" alt="${post.topic}">` : `<div class="blog-gallery-placeholder"></div>`}
                </div>
                <div class="blog-gallery-content">
                    <div class="blog-gallery-ghost-number">${ghostNumber}</div>
                    <div class="blog-gallery-text-content">
                        <h3 class="blog-gallery-topic">${post.topic}</h3>
                        <p class="blog-gallery-date">${post.date}</p>
                        <p class="blog-gallery-desc">${post.description}</p>
                        <a href="${post.link}" class="blog-gallery-link">Learn More <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </div>
            </div>`;
});
cardsHTML += '\n            ';

// 3. Inject into index.html
try {
    let indexData = fs.readFileSync(INDEX_PATH, 'utf8');
    const startTag = '<!-- BLOG_GALLERY_START -->';
    const endTag = '<!-- BLOG_GALLERY_END -->';
    
    const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`, 'g');
    const replacement = `${startTag}${cardsHTML}${endTag}`;
    
    if (regex.test(indexData)) {
        indexData = indexData.replace(regex, replacement);
        fs.writeFileSync(INDEX_PATH, indexData, 'utf8');
        console.log('Successfully injected blog cards into index.html');
    } else {
        console.error('Could not find BLOG_GALLERY_START/END injection markers in index.html!');
    }
} catch (err) {
    console.error('Error processing index.html:', err);
}

// 4. Generate individual blog pages
let templateBlock = '';
try {
    templateBlock = fs.readFileSync(TEMPLATE_PATH, 'utf8');
} catch (err) {
    console.error('Error reading blog-template.html:', err);
    process.exit(1);
}

blogData.forEach(post => {
    let pageHtml = templateBlock;
    pageHtml = pageHtml.replace(/{{TITLE}}/g, post.topic);
    pageHtml = pageHtml.replace(/{{DATE}}/g, post.date);
    pageHtml = pageHtml.replace(/{{CONTENT}}/g, post.content);
    
    // Previous Link
    if (post.prev) {
        pageHtml = pageHtml.replace(/{{PREV_LINK}}/g, `<a href="blog-${post.prev}.html" class="nav-btn">&larr; Previous</a>`);
    } else {
        pageHtml = pageHtml.replace(/{{PREV_LINK}}/g, `<span class="nav-btn disabled">&larr; Previous</span>`);
    }
    
    // Next Link
    if (post.next) {
        pageHtml = pageHtml.replace(/{{NEXT_LINK}}/g, `<a href="blog-${post.next}.html" class="nav-btn">Next &rarr;</a>`);
    } else {
        pageHtml = pageHtml.replace(/{{NEXT_LINK}}/g, `<span class="nav-btn disabled">Next &rarr;</span>`);
    }

    const outputPath = path.join(ROOT_DIR, post.link);
    fs.writeFileSync(outputPath, pageHtml, 'utf8');
    console.log(`Generated page: ${post.link}`);
    
    // Track page for sitemaps
    sitePages.push(post.link);
});

console.log('Blog generation complete!');

// 5. Generate sitemap.xml
let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
sitePages.forEach(page => {
    const loc = `${BASE_URL}/${page}`;
    xmlContent += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n  </url>\n`;
});
xmlContent += `</urlset>`;

try {
    fs.writeFileSync(SITEMAP_XML_PATH, xmlContent, 'utf8');
    console.log('Successfully generated sitemap.xml');
} catch (err) {
    console.error('Error generating sitemap.xml:', err);
}

// 6. Generate sitemap.html
let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sitemap | Mosa Moleleki</title>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0a0a0a;
            color: #ffffff;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        h1 { color: #008cff; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 10px; }
        a {
            color: #a3a3a3;
            text-decoration: none;
            transition: color 0.3s;
        }
        a:hover { color: #008cff; }
    </style>
</head>
<body>
    <h1>Sitemap</h1>
    <ul>
`;

sitePages.forEach(page => {
    htmlContent += `        <li><a href="${page}">${page}</a></li>\n`;
});

htmlContent += `    </ul>
</body>
</html>`;

try {
    fs.writeFileSync(SITEMAP_HTML_PATH, htmlContent, 'utf8');
    console.log('Successfully generated sitemap.html');
} catch (err) {
    console.error('Error generating sitemap.html:', err);
}

console.log('Unified build process completed entirely.');
