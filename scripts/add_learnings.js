const fs = require('fs');
const path = require('path');

const PROJECTS_DATA_PATH = path.join(__dirname, '../data/projects.json');

try {
    const rawData = fs.readFileSync(PROJECTS_DATA_PATH, 'utf8');
    const projects = JSON.parse(rawData);

    projects.forEach(proj => {
        if (!proj.learnings) {
            proj.learnings = `Building the ${proj.title} project was an incredible learning experience. I gained deep, practical knowledge working with modern web architectures and specifically honed my skills in ${proj.technologies && proj.technologies.length > 0 ? proj.technologies[0] : 'frontend development'}. The biggest takeaway was understanding how to build scalable, maintainable systems while keeping the user experience as the top priority.`;
        }
    });

    fs.writeFileSync(PROJECTS_DATA_PATH, JSON.stringify(projects, null, 4), 'utf8');
    console.log(`Successfully added 'learnings' field to ${projects.length} projects.`);
} catch (err) {
    console.error('Error updating projects.json:', err);
}
