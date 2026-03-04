let sitePages = [
    'index.html',
    'articles.html',
    'posts/online-feedbacks.html',
    'posts/features-integration.html',
    'projects/finance-dashboard.html',
    'projects/e-commerce-platform.html'
];

const fileTree = {};
sitePages.forEach(page => {
    const parts = page.split('/');
    let current = fileTree;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
            current[part] = { _path: null, _children: {} };
        }
        if (i === parts.length - 1) {
            current[part]._path = page; // It's a file
        }
        // Advance pointer
        current = current[part]._children;
    }
});

console.log(JSON.stringify(fileTree, null, 2));

function renderTreeBranch(node, level = 0) {
    let html = '<ul class="tree-branch" style="--level: ' + level + ';">\n';
    const keys = Object.keys(node).sort((a, b) => {
        // Folders first, then files
        const isFolderA = Object.keys(node[a]._children).length > 0;
        const isFolderB = Object.keys(node[b]._children).length > 0;
        if (isFolderA !== isFolderB) return isFolderA ? -1 : 1;
        return a.localeCompare(b);
    });

    keys.forEach((key, index) => {
        const item = node[key];
        const isLast = index === keys.length - 1;
        const hasChildren = Object.keys(item._children).length > 0;
        
        html += `  <li class="tree-item ${isLast ? 'is-last' : ''}">\n`;
        html += `    <div class="tree-row">\n`;
        html += `      <span class="tree-line"></span>\n`;
        
        if (hasChildren) {
            html += `      <i class="fa-solid fa-folder tree-icon directory"></i>\n`;
            html += `      <span class="tree-label">${key}</span>\n`;
            html += `    </div>\n`;
            html += renderTreeBranch(item._children, level + 1);
        } else {
            const ext = key.split('.').pop();
            let iconClass = 'fa-file-code';
            if (ext === 'html') iconClass = 'fa-file-code html-file';
            else if (ext === 'xml') iconClass = 'fa-file-code xml-file';
            
            html += `      <i class="fa-solid ${iconClass} tree-icon file"></i>\n`;
            html += `      <a href="/${item._path}" class="tree-label">${key}</a>\n`;
            html += `    </div>\n`;
        }
        html += `  </li>\n`;
    });
    html += '</ul>\n';
    return html;
}

console.log(renderTreeBranch(fileTree, 0));
