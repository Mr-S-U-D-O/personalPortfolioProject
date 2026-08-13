const fs = require('fs');
const path = require('path');

const filesToProcess = [
    '404.html',
    'about.html',
    'index.html',
    'projects.html',
    'sitemap.html',
    'templates/post-template.html',
    'templates/project-template.html',
    'templates/projects-gallery-template.html',
    'templates/sitemap-template.html'
];

const iconMap = {
    'fa-envelope-open-text': 'mail',
    'fa-envelope': 'mail',
    'fa-phone-volume': 'phone',
    'fa-phone': 'phone',
    'fa-terminal': 'terminal',
    'fa-location-dot': 'map-pin',
    'fa-chevron-right': 'chevron-right',
    'fa-github': 'github',
    'fa-linkedin-in': 'linkedin',
    'fa-star': 'star',
    'fa-house': 'home',
    'fa-user': 'user',
    'fa-folder-open': 'folder-open',
    'fa-pen-nib': 'pen-tool',
    'fa-xmark': 'x',
    'fa-bars': 'menu',
    'fa-arrow-right': 'arrow-right',
    'fa-magnifying-glass-chart': 'bar-chart',
    'fa-folder': 'folder',
    'fa-file-code': 'file-code'
};

filesToProcess.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
        console.warn('File not found:', file);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace Footer
    const footerRegex = /<footer class="site-footer">[\s\S]*?<\/footer>/g;
    content = content.replace(footerRegex, '<!-- INJECT_GLOBAL_FOOTER -->');
    
    // Replace FontAwesome Icons
    content = content.replace(/<i class="(?:fa-solid|fa-brands) (fa-[^"]+)"><\/i>/g, (match, p1) => {
        let lucideName = iconMap[p1] || p1.replace('fa-', '');
        return `<i data-lucide="${lucideName}"></i>`;
    });
    
    // Handle edge cases with extra classes e.g. <i class="fa-solid fa-file-code xml-file">
    content = content.replace(/<i class="(?:fa-solid|fa-brands) (fa-[^\s"]+)([^"]*)"><\/i>/g, (match, p1, p2) => {
        let lucideName = iconMap[p1] || p1.replace('fa-', '');
        return `<i data-lucide="${lucideName}" class="${p2.trim()}"></i>`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed:', file);
});
