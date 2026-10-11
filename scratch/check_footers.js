const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('.');
const htmlFiles = [];

const findHtmlFiles = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== "templates") findHtmlFiles(fullPath);
    } else if (file.endsWith(".html")) {
      htmlFiles.push(fullPath);
    }
  });
};
findHtmlFiles(rootDir);

const report = htmlFiles.map(f => {
  const rel = path.relative(rootDir, f);
  const content = fs.readFileSync(f, 'utf8');
  const hasFooterCss = content.includes('footer.min.css') || content.includes('footer.css');
  const footerMatch = content.match(/<footer[^>]*class="([^"]*)"[^>]*>/i);
  const hasFooter = !!footerMatch;
  const footerClass = footerMatch ? footerMatch[1] : 'NONE';
  const hasSitemapLink = content.includes('sitemap.html');
  const hasLucide = content.includes('lucide');

  return {
    file: rel,
    hasFooterCss,
    hasFooter,
    footerClass,
    hasSitemapLink,
    hasLucide
  };
});

console.log(JSON.stringify(report, null, 2));
