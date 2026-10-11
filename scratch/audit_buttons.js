const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'about.html',
  '404.html',
  'projects.html',
  'sitemap.html',
  'templates/footer-template.html',
  'templates/project-template.html',
  'templates/post-template.html',
  'templates/projects-gallery-template.html',
  'templates/sitemap-template.html'
];

const results = {};

files.forEach(f => {
  const p = path.resolve(f);
  if (!fs.existsSync(p)) return;
  const content = fs.readFileSync(p, 'utf8');
  
  // Find all <button tags
  const btnTags = content.match(/<button[\s\S]*?>/gi) || [];
  // Find all <a> tags with class containing btn
  const aBtns = content.match(/<a[^>]*class="[^"]*(?:btn|pill)[^"]*"[\s\S]*?>/gi) || [];

  results[f] = {
    buttons: [...new Set(btnTags.map(b => b.replace(/\s+/g, ' ').trim()))],
    aTags: [...new Set(aBtns.map(a => a.replace(/\s+/g, ' ').trim()))]
  };
});

console.log(JSON.stringify(results, null, 2));
