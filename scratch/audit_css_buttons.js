const fs = require('fs');
const path = require('path');

const cssDir = path.resolve('css');
const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css') && !f.includes('.min.'));

const patterns = [
  'hero-btn',
  'about-explore-btn',
  'nav-back-btn',
  'blog-back-btn',
  'footer-cta-pill',
  'footer-github-star-btn',
  'footer-icon-link',
  'theme-toggle',
  'back-to-top',
  'modal-close',
  'clear-search',
  'copyLinkBtn',
  'nav-direction-btn',
  'view-project-btn',
  'lets-talk-btn'
];

const report = {};

files.forEach(f => {
  const content = fs.readFileSync(path.join(cssDir, f), 'utf8');
  patterns.forEach(pat => {
    if (content.includes(pat)) {
      if (!report[pat]) report[pat] = [];
      report[pat].push(f);
    }
  });
});

console.log(JSON.stringify(report, null, 2));
