const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const CleanCSS = require('clean-css');
const terser = require('terser');

// Configuration
const BASE_URL = 'https://www.sudo.co.za'; // Adjust this when deploying
const ROOT_DIR = path.join(__dirname, '../');
const DATA_PATH = path.join(__dirname, '../data/blog.json');
const INDEX_PATH = path.join(__dirname, '../index.html');
const TEMPLATE_PATH = path.join(__dirname, '../templates/blog-template.html');
const SITEMAP_XML_PATH = path.join(__dirname, '../sitemap.xml');
const SITEMAP_HTML_PATH = path.join(__dirname, '../sitemap.html');
const POSTS_DIR = path.join(__dirname, '../posts');
const ARTICLES_PATH = path.join(__dirname, '../articles.html');

// Cache Busting Version
const VERSION = Date.now();

console.log('Starting unified build process...');

// Utility to create URL-friendly slug
function createSlug(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

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
// Map blogData to include slugs and correct paths
blogData = blogData.map((post) => {
    return {
        ...post,
        slug: createSlug(post.topic)
    };
});

blogData.forEach((post, index) => {
    post.link = `posts/${post.slug}.html`; // Used in index.html, archive, and sitemaps
    post.prevSlug = index > 0 ? blogData[index - 1].slug : null;
    post.nextSlug = index < blogData.length - 1 ? blogData[index + 1].slug : null;
});

// We only want the latest 3 posts for the index page. We assume newest are at the end, so we reverse and take 3.
const latestPosts = [...blogData].reverse().slice(0, 3);

latestPosts.forEach((post, index) => {
    // Format index correctly for latest 3
    const actualPostNumber = blogData.length - index;
    const ghostNumber = actualPostNumber.toString().padStart(2, '0');
    
    cardsHTML += `
            <div class="blog-gallery-item">
                <div class="blog-gallery-image-wrapper">
                    ${post.image ? `<img src="${post.image}" alt="${post.topic}" loading="lazy">` : `<div class="blog-gallery-placeholder"></div>`}
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

// Add the See All Posts button to the index gallery
cardsHTML += `\n            <div style="text-align: center; margin-top: 3rem; grid-column: 1 / -1; width: 100%;">
                <a href="articles.html" class="lets-talk-btn" style="display: inline-block; text-decoration: none;">See All Posts</a>
            </div>\n            `;

// 3. Inject into index.html
try {
    let indexData = fs.readFileSync(INDEX_PATH, 'utf8');
    const startTag = '<!-- BLOG_GALLERY_START -->';
    const endTag = '<!-- BLOG_GALLERY_END -->';
    
    const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`, 'g');
    const replacement = `${startTag}${cardsHTML}${endTag}`;
    
    if (regex.test(indexData)) {
        indexData = indexData.replace(regex, replacement);
        
        // Cache Busting for index.html
        indexData = indexData.replace(/\.css(\?v=\d+)?/g, `.css?v=${VERSION}`);
        indexData = indexData.replace(/\.js(\?v=\d+)?/g, `.js?v=${VERSION}`);
        
        fs.writeFileSync(INDEX_PATH, indexData, 'utf8');
        console.log('Successfully injected blog cards and updated cache busting in index.html');
    } else {
        console.error('Could not find BLOG_GALLERY_START/END injection markers in index.html!');
    }
} catch (err) {
    console.error('Error processing index.html:', err);
}

// 4. Purge old directory and generate individual blog pages
if (fs.existsSync(POSTS_DIR)) {
    fs.rmSync(POSTS_DIR, { recursive: true, force: true });
    console.log('Purged old posts/ folder.');
}
fs.mkdirSync(POSTS_DIR, { recursive: true });

let templateBlock = '';
try {
    templateBlock = fs.readFileSync(TEMPLATE_PATH, 'utf8');
} catch (err) {
    console.error('Error reading blog-template.html:', err);
    process.exit(1);
}

// Optional cleanup of old root pages: delete any blog-*.html in root
const rootFiles = fs.readdirSync(ROOT_DIR);
rootFiles.forEach(file => {
    if (file.startsWith('blog-') && file.endsWith('.html')) {
        fs.unlinkSync(path.join(ROOT_DIR, file));
        console.log(`Deleted legacy root file: ${file}`);
    }
});

blogData.forEach(post => {
    let pageHtml = templateBlock;
    pageHtml = pageHtml.replace(/{{TITLE}}/g, post.topic);
    pageHtml = pageHtml.replace(/{{DATE}}/g, post.date);
    
    // Load Content from JSON directly
    let markedHtml = post.content || '<p>Content coming soon...</p>';
    
    pageHtml = pageHtml.replace(/{{CONTENT}}/g, markedHtml);
    
    // SEO Replacements
    const pageUrl = `${BASE_URL}/posts/${post.slug}.html`;
    const ogImage = post.image ? `${BASE_URL}/${post.image}` : '';
    const heroImage = post.image ? `../${post.image}` : '';
    const author = "Mosa Moleleki";
    
    let publishedDate = new Date().toISOString();
    try {
        if (post.date) publishedDate = new Date(post.date).toISOString();
    } catch(e) {}

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.topic,
        "image": ogImage || `${BASE_URL}/my pictures/dark mode.webp`,
        "author": {
            "@type": "Person",
            "name": author,
            "url": `${BASE_URL}/`
        },
        "publisher": {
            "@type": "Organization",
            "name": "Mosa Moleleki",
            "logo": {
                "@type": "ImageObject",
                "url": `${BASE_URL}/my pictures/dark mode.webp`
            }
        },
        "datePublished": publishedDate,
        "description": post.description || ''
    };
    
    pageHtml = pageHtml.replace(/{{DESCRIPTION}}/g, post.description || '');
    pageHtml = pageHtml.replace(/{{AUTHOR}}/g, author);
    pageHtml = pageHtml.replace(/{{PAGE_URL}}/g, pageUrl);
    pageHtml = pageHtml.replace(/{{OG_IMAGE}}/g, ogImage);
    pageHtml = pageHtml.replace(/{{HERO_IMAGE}}/g, heroImage);
    pageHtml = pageHtml.replace(/{{JSON_LD}}/g, `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`);
    
    // Cache Busting
    pageHtml = pageHtml.replace(/\.css"/g, `.css?v=${VERSION}"`);
    pageHtml = pageHtml.replace(/\.js"/g, `.js?v=${VERSION}"`);
    
    // Previous Link
    if (post.prevSlug) {
        pageHtml = pageHtml.replace(/{{PREV_LINK}}/g, `<a href="${post.prevSlug}.html" class="nav-btn">&larr; Previous</a>`);
    } else {
        pageHtml = pageHtml.replace(/{{PREV_LINK}}/g, `<span class="nav-btn disabled">&larr; Previous</span>`);
    }
    
    // Next Link
    if (post.nextSlug) {
        pageHtml = pageHtml.replace(/{{NEXT_LINK}}/g, `<a href="${post.nextSlug}.html" class="nav-btn">Next &rarr;</a>`);
    } else {
        pageHtml = pageHtml.replace(/{{NEXT_LINK}}/g, `<span class="nav-btn disabled">Next &rarr;</span>`);
    }

    const outputPath = path.join(POSTS_DIR, `${post.slug}.html`);
    fs.writeFileSync(outputPath, pageHtml, 'utf8');
    console.log(`Generated page: ${post.link}`);
    
    // Track page for sitemaps
    sitePages.push(post.link);
});

// 5. Generate articles.html (Archive Page)
let allCardsHTML = '\n';
[...blogData].reverse().forEach((post, index) => {
    // We use the bento/glow layout structure but customized for blogs
    allCardsHTML += `
            <div class="blog-card glow-card">
                <a href="${post.link}" class="glow-content" style="text-decoration: none; display: flex; flex-direction: column;">
                    <div class="blog-gallery-image-wrapper">
                        ${post.image ? `<img src="${post.image}" alt="${post.topic}" loading="lazy">` : `<div class="blog-gallery-placeholder"></div>`}
                    </div>
                    <div class="blog-gallery-content">
                        <div class="blog-gallery-text-content">
                            <h3 class="blog-gallery-topic">${post.topic}</h3>
                            <p class="blog-gallery-date">${post.date}</p>
                            <p class="blog-gallery-desc">${post.description}</p>
                            <span class="blog-gallery-link">Read Article <i class="fa-solid fa-arrow-right"></i></span>
                        </div>
                    </div>
                </a>
            </div>`;
});

const articlesHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Articles | Mosa Moleleki</title>
    <meta name="description" content="All articles and blog posts by Mosa Moleleki, Front-End Web Developer.">
    <link rel="canonical" href="https://www.sudo.co.za/articles.html">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.sudo.co.za/articles.html">
    <meta property="og:title" content="All Articles | Mosa Moleleki">
    <link rel="stylesheet" href="css/min/style.min.css?v=${VERSION}">
    <link rel="stylesheet" href="css/all.min.css?v=${VERSION}">
    <link rel="stylesheet" href="css/min/blog.min.css?v=${VERSION}">
    <!-- Universal Theme System (non-deferred to prevent flash) -->
    <script src="js/min/theme.min.js?v=${VERSION}"><\/script>
</head>
<body>
    <!-- Theme Toggle -->
    <div class="utility-toggles" style="z-index: 10000;">
        <button class="theme-toggle" data-theme-toggle aria-label="Toggle Dark Mode">
            <i class="fa-solid fa-moon"></i>
        </button>
    </div>

    <!-- Back Button — fixed top-left via blog.css -->
    <a href="index.html#blog" class="back-home-btn"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>

    <section class="blog-gallery-section" style="padding-top: 120px;">
        <div class="blog-section-header">
            <h2 class="blog-title">
                <span class="blog-main-text">All Articles</span>
                <span class="blog-ghost-text">Articles</span>
            </h2>
        </div>
        <div class="blog-gallery-grid">
            ${allCardsHTML}
        </div>
    </section>

    <script>
        document.addEventListener('DOMContentLoaded', function () {
            if (window.ThemeSystem) window.ThemeSystem.init();
        });
    <\/script>
</body>
</html>`;

try {
    fs.writeFileSync(ARTICLES_PATH, articlesHTML, 'utf8');
    console.log('Successfully generated articles.html');
    sitePages.push('articles.html');
} catch (err) {
    console.error('Error generating articles.html:', err);
}

console.log('Blog generation complete!');

// ==========================================
// 6. Generate Project Pages
// ==========================================
console.log('Starting project pages generation...');
const PROJECTS_DATA_PATH = path.join(__dirname, '../data/projects.json');
const PROJECT_TEMPLATE_PATH = path.join(__dirname, '../templates/project-template.html');
const PROJECTS_OUT_DIR = path.join(__dirname, '../projects');

let projectsData = [];
try {
    const rawProjData = fs.readFileSync(PROJECTS_DATA_PATH, 'utf8');
    projectsData = JSON.parse(rawProjData);
    console.log(`Loaded ${projectsData.length} projects from data/projects.json`);
} catch (err) {
    console.error('Error reading data/projects.json:', err);
}

// Add slug and links
projectsData = projectsData.map(proj => {
    return {
        ...proj,
        slug: createSlug(proj.title)
    };
});

projectsData.forEach((proj, index) => {
    proj.link = `projects/${proj.slug}.html`;
    proj.prevSlug = index > 0 ? projectsData[index - 1].slug : null;
    proj.nextSlug = index < projectsData.length - 1 ? projectsData[index + 1].slug : null;
});

// Write the updated data back to projects.json so the client-side index.js picks up the correct links
try {
    fs.writeFileSync(PROJECTS_DATA_PATH, JSON.stringify(projectsData, null, 4), 'utf8');
    console.log('Updated data/projects.json with generated slugs and links.');
} catch (err) {
    console.error('Error writing to data/projects.json:', err);
}

if (fs.existsSync(PROJECTS_OUT_DIR)) {
    const files = fs.readdirSync(PROJECTS_OUT_DIR);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            fs.unlinkSync(path.join(PROJECTS_OUT_DIR, file));
        }
    });
    console.log('Purged old project HTML files.');
} else {
    fs.mkdirSync(PROJECTS_OUT_DIR, { recursive: true });
}

let projectTemplateBlock = '';
try {
    projectTemplateBlock = fs.readFileSync(PROJECT_TEMPLATE_PATH, 'utf8');
} catch (err) {
    console.error('Error reading project-template.html:', err);
}

if (projectTemplateBlock && projectsData.length > 0) {
    projectsData.forEach(proj => {
        let pageHtml = projectTemplateBlock;
        
        // Load Content
        let projContentHtml = proj.content || '';

        pageHtml = pageHtml.replace(/{{TITLE}}/g, proj.title || '');
        pageHtml = pageHtml.replace(/{{DESCRIPTION}}/g, proj.description || '');
        pageHtml = pageHtml.replace(/{{CATEGORY}}/g, proj.category || '');
        pageHtml = pageHtml.replace(/{{ROLE}}/g, proj.role || '');
        pageHtml = pageHtml.replace(/{{YEAR}}/g, proj.year || '');
        pageHtml = pageHtml.replace(/{{CONTENT}}/g, projContentHtml);
        
        const pageUrl = `${BASE_URL}/projects/${proj.slug}.html`;
        const ogImage = proj.fullImage.startsWith('http') ? proj.fullImage : `${BASE_URL}/${proj.fullImage}`;
        const displayImage = (proj.fullImage && !proj.fullImage.startsWith('http')) ? `../${proj.fullImage}` : (proj.fullImage || '');
        
        pageHtml = pageHtml.replace(/{{PAGE_URL}}/g, pageUrl);
        pageHtml = pageHtml.replace(/{{OG_IMAGE}}/g, ogImage);
        pageHtml = pageHtml.replace(/{{FULL_IMAGE}}/g, displayImage);
        
        // Links
        let liveLinkHtml = proj.liveLink && proj.liveLink !== '#' ? `<a href="${proj.liveLink}" target="_blank" rel="noopener noreferrer" class="project-link-btn"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>` : '';
        let githubLinkHtml = proj.githubLink && proj.githubLink !== '#' ? `<a href="${proj.githubLink}" target="_blank" rel="noopener noreferrer" class="project-link-btn"><i class="fa-brands fa-github"></i> GitHub Repo</a>` : '';
        pageHtml = pageHtml.replace(/{{LIVE_LINK_HTML}}/g, liveLinkHtml);
        pageHtml = pageHtml.replace(/{{GITHUB_LINK_HTML}}/g, githubLinkHtml);
        
        // Technologies
        let techHtml = (proj.technologies || []).map(tech => `<span class="tech-pill">${tech}</span>`).join('\n                ');
        pageHtml = pageHtml.replace(/{{TECHNOLOGIES_HTML}}/g, techHtml);

        // Overview Details with fallbacks
        let overviewDetailsHtml = '';
        const roleStr = (proj.overviewDetails && proj.overviewDetails.myRole) ? proj.overviewDetails.myRole : (proj.role || '');
        const durStr = (proj.overviewDetails && proj.overviewDetails.duration) ? proj.overviewDetails.duration : (proj.year || '');
        const teamStr = (proj.overviewDetails && proj.overviewDetails.teamSize) ? proj.overviewDetails.teamSize : '';
        const platStr = (proj.overviewDetails && proj.overviewDetails.platform) ? proj.overviewDetails.platform : (proj.category || '');

        overviewDetailsHtml = `
            <div class="overview-details-grid">
                ${roleStr ? `<div class="detail-item"><span class="detail-label">Role</span><span class="detail-val">${roleStr}</span></div>` : ''}
                ${durStr ? `<div class="detail-item"><span class="detail-label">Timeline</span><span class="detail-val">${durStr}</span></div>` : ''}
                ${teamStr ? `<div class="detail-item"><span class="detail-label">Team</span><span class="detail-val">${teamStr}</span></div>` : ''}
                ${platStr ? `<div class="detail-item"><span class="detail-label">Platform</span><span class="detail-val">${platStr}</span></div>` : ''}
            </div>`;
        pageHtml = pageHtml.replace(/{{OVERVIEW_DETAILS_HTML}}/g, overviewDetailsHtml);
        
        // Cache Busting
        pageHtml = pageHtml.replace(/\.css"/g, `.css?v=${VERSION}"`);
        pageHtml = pageHtml.replace(/\.js"/g, `.js?v=${VERSION}"`);

        // Metrics
        let metricsHtml = '';
        if (proj.metrics && proj.metrics.length > 0) {
            metricsHtml = `
                <section class="project-metrics-section fade-element">
                    <div class="metrics-grid">
                        ${proj.metrics.map(m => `
                            <div class="metric-card">
                                <h3 class="metric-val text-primary">
                                    <span class="val-main">${m.value}</span>
                                    <span class="val-ghost">${m.value}</span>
                                </h3>
                                <p class="metric-label">${m.label}</p>
                            </div>
                        `).join('')}
                    </div>
                </section>`;
        }
        pageHtml = pageHtml.replace(/{{METRICS_HTML}}/g, metricsHtml);

        // Features Section
        let featuresHtml = '';
        if (proj.keyFeatures && proj.keyFeatures.length > 0) {
            featuresHtml = `
                <section class="project-features-section fade-element">
                    <div class="project-section-header">
                        <h2 class="section-title">
                            <span class="title-main">Key Features</span>
                            <span class="title-ghost">Features</span>
                        </h2>
                    </div>
                    <ul class="results-list">
                        ${proj.keyFeatures.map(f => `<li>${f}</li>`).join('\n')}
                    </ul>
                </section>`;
        }
        pageHtml = pageHtml.replace(/{{FEATURES_HTML}}/g, featuresHtml);

        // Videos Showcase
        let videosHtml = '';
        if (proj.videos && proj.videos.length > 0) {
            videosHtml = `
                <section class="project-videos-section fade-element">
                    <div class="project-section-header">
                        <h2 class="section-title">
                            <span class="title-main">In Motion</span>
                            <span class="title-ghost">Motion</span>
                        </h2>
                    </div>
                    <div class="videos-container">
                        ${proj.videos.map(v => `
                            <div class="video-wrapper premium-media-container">
                                <video src="../${v.src}" autoplay loop muted playsinline class="project-video"></video>
                            </div>
                        `).join('\n')}
                    </div>
                </section>`;
        }
        pageHtml = pageHtml.replace(/{{VIDEOS_HTML}}/g, videosHtml);

        // Gallery
        let galleryHtml = '';
        if (proj.gallery && proj.gallery.length > 0) {
            galleryHtml = `
                <section class="project-gallery-section fade-element">
                    <div class="project-section-header">
                        <h2 class="section-title">
                            <span class="title-main">Gallery</span>
                            <span class="title-ghost">Visuals</span>
                        </h2>
                    </div>
                    <div class="premium-gallery-grid">
                        ${proj.gallery.map(img => `
                            <div class="gallery-item premium-media-container">
                                <img src="../${img}" alt="Gallery Image" loading="lazy">
                            </div>
                        `).join('')}
                    </div>
                </section>`;
        }
        pageHtml = pageHtml.replace(/{{GALLERY_HTML}}/g, galleryHtml);

        // Quote
        let quoteHtml = '';
        if (proj.quote) {
            quoteHtml = `
                <section class="project-quote-section fade-element">
                    <blockquote class="premium-quote">
                        <p>"${proj.quote.text}"</p>
                        ${proj.quote.author ? `<cite>&mdash; ${proj.quote.author}</cite>` : ''}
                    </blockquote>
                </section>`;
        }
        pageHtml = pageHtml.replace(/{{QUOTE_HTML}}/g, quoteHtml);

        // Learnings
        let learningsHtml = '';
        if (proj.learnings && proj.learnings.length > 0) {
            learningsHtml = `
                <section class="project-learnings-section fade-element">
                    <span class="ghost-text">Insights</span>
                    <h2 class="section-title">Key Takeaways</h2>
                    <ul class="learnings-list">
                        ${proj.learnings.map(l => `<li><i class="fa-solid fa-check list-icon"></i> <span>${l}</span></li>`).join('')}
                    </ul>
                </section>`;
        }
        pageHtml = pageHtml.replace(/{{LEARNINGS_HTML}}/g, learningsHtml);



        // 2. Visual Evolution (Before / After Slider)
        let beforeAfterHtml = '';
        if (proj.beforeAfter) {
            beforeAfterHtml = `
                <section class="project-visual-comparison fade-element">
                    <div class="project-section-header">
                        <h2 class="section-title">
                            <span class="title-main">Visual Evolution</span>
                            <span class="title-ghost">Evolution</span>
                        </h2>
                    </div>
                    <p class="section-desc">Comparing the initial wireframes/concepts with the final polished implementation.</p>
                    <div class="before-after-container">
                        <div class="comparison-slider-wrapper">
                            <div class="comparison-slider">
                                <img class="comparison-img before" src="../${proj.beforeAfter.before}" alt="Initial Version">
                                <img class="comparison-img after" src="../${proj.beforeAfter.after}" alt="Final Version">
                                <div class="slider-handle">
                                    <i class="fa-solid fa-arrows-left-right"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>`;
        }
        pageHtml = pageHtml.replace(/{{BEFORE_AFTER_HTML}}/g, beforeAfterHtml);

        // Responsive Views Showcase
        let responsiveHtml = '';
        if (proj.responsiveViews) {
            responsiveHtml = `
                <section class="project-responsive-section fade-element">
                    <div class="project-section-header">
                        <h2 class="section-title">
                            <span class="title-main">Responsive Design</span>
                            <span class="title-ghost">Devices</span>
                        </h2>
                    </div>
                    <p class="section-desc">A seamless experience across desktop, tablet, and mobile devices.</p>
                    <div class="responsive-showcase">
                        <div class="responsive-frames">
                            ${proj.responsiveViews.desktop ? `<div class="device-frame desktop-frame"><img src="../${proj.responsiveViews.desktop}" alt="Desktop View"></div>` : ''}
                            ${proj.responsiveViews.tablet ? `<div class="device-frame tablet-frame"><img src="../${proj.responsiveViews.tablet}" alt="Tablet View"></div>` : ''}
                            ${proj.responsiveViews.mobile ? `<div class="device-frame mobile-frame"><img src="../${proj.responsiveViews.mobile}" alt="Mobile View"></div>` : ''}
                        </div>
                    </div>
                </section>`;
        }
        pageHtml = pageHtml.replace(/{{RESPONSIVE_VIEWS_HTML}}/g, responsiveHtml);

        // 3. Technical Challenges
        let challengesHtml = '';
        if (proj.challengesStructured && proj.challengesStructured.length > 0) {
            challengesHtml = `
                <section class="project-challenges-section fade-element">
                    <div class="project-section-header">
                        <h2 class="section-title">
                            <span class="title-main">Technical Challenges</span>
                            <span class="title-ghost">Core</span>
                        </h2>
                    </div>
                    <div class="challenges-grid">
                        ${proj.challengesStructured.map(ch => `
                            <div class="challenge-pair">
                                <div class="challenge-side">
                                    <span class="side-label issue">The Problem</span>
                                    <p>${ch.issue}</p>
                                </div>
                                <div class="solution-side">
                                    <span class="side-label solution">The Solution</span>
                                    <p>${ch.solution}</p>
                                </div>
                            </div>`).join('\n')}
                    </div>
                </section>`;
        }
        pageHtml = pageHtml.replace(/{{CHALLENGES_HTML}}/g, challengesHtml);

        // 4. Project Outcomes — clean unordered list (no cards)
        let resultsHtml = `
            <section class="project-results-section fade-element">
                <div class="project-section-header">
                    <h2 class="section-title">
                        <span class="title-main">Project Outcomes</span>
                        <span class="title-ghost">Impact</span>
                    </h2>
                </div>
                <div class="results-container">
                    <ul class="results-list">
                        ${(proj.outcomes || []).map(res => `<li>${res}</li>`).join('\n')}
                    </ul>
                </div>
            </section>`;
        pageHtml = pageHtml.replace(/{{RESULTS_HTML}}/g, resultsHtml);
        
        // Prev / Next Links
        if (proj.prevSlug) {
            let prevProj = projectsData.find(p => p.slug === proj.prevSlug);
            pageHtml = pageHtml.replace(/{{PREV_LINK}}/g, `<a href="${proj.prevSlug}.html" class="nav-direction-btn prev-btn"><span class="direction-label">Previous</span><span class="target-title">${prevProj.title}</span></a>`);
        } else {
            pageHtml = pageHtml.replace(/{{PREV_LINK}}/g, `<div></div>`);
        }
        
        if (proj.nextSlug) {
            let nextProj = projectsData.find(p => p.slug === proj.nextSlug);
            pageHtml = pageHtml.replace(/{{NEXT_LINK}}/g, `<a href="${proj.nextSlug}.html" class="nav-direction-btn next-btn"><span class="direction-label">Next</span><span class="target-title">${nextProj.title}</span></a>`);
        } else {
            pageHtml = pageHtml.replace(/{{NEXT_LINK}}/g, `<div></div>`);
        }
        
        const outputPath = path.join(PROJECTS_OUT_DIR, `${proj.slug}.html`);
        fs.writeFileSync(outputPath, pageHtml, 'utf8');
        console.log(`Generated project page: ${proj.link}`);
        
        sitePages.push(proj.link);
    });
}
console.log('Project generation complete!');

// 7. Generate sitemap.xml
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
// First, build a tree structure from the paths
const fileTree = {};
sitePages.forEach(page => {
    // If it's the root site, page is 'index.html'
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
        current = current[part]._children;
    }
});

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

let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sitemap | File Tree</title>
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Global Styles -->
    <link rel="stylesheet" href="/css/min/style.min.css">
    <link rel="stylesheet" href="/css/min/blog.min.css">
    
    <style>
        /* Sitemap Specific Overrides */
        body {
            /* Handled by style.css but ensure un-hide on load */
            overflow: auto;
            padding-bottom: 80px;
        }
        
        .sitemap-wrapper {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Tree Layout */
        .file-tree-container {
            font-family: 'Fira Code', monospace;
            font-size: 0.95rem;
            background: var(--skeleton-base);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 30px;
            overflow-x: auto;
            margin-top: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .tree-branch {
            list-style: none;
            padding: 0;
            margin: 0;
            position: relative;
        }
        
        .tree-branch[style*="--level: 0"] > .tree-item > .tree-row > .tree-line {
            display: none; /* No lines for root level */
        }
        
        .tree-branch:not([style*="--level: 0"]) {
            padding-left: 24px;
            margin-left: -4px;
            border-left: 1px dotted var(--glass-border);
        }
        
        .tree-item {
            position: relative;
        }
        
        .tree-row {
            display: flex;
            align-items: center;
            padding: 8px 10px;
            border-radius: 6px;
            margin: 2px 0;
            transition: background 0.2s, transform 0.2s;
            position: relative;
        }
        
        .tree-row:hover {
            background-color: var(--glass-bg);
            transform: translateX(2px);
        }
        
        /* The horizontal branch line */
        .tree-line {
            position: absolute;
            left: -24px;
            top: 50%;
            width: 20px;
            border-top: 1px dotted var(--glass-border);
            z-index: 0;
        }
        
        /* Hide bottom tail of vertical line for last items */
        .tree-item.is-last > .tree-row::before {
            content: '';
            position: absolute;
            left: -25px;
            top: 50%;
            bottom: -200px; /* Cover any continuing border */
            width: 4px;
            background: var(--skeleton-base); /* Match container background */
            z-index: -1;
            transition: background 0.4s ease;
        }
        
        .tree-icon {
            margin-right: 12px;
            font-size: 1.1em;
            width: 16px;
            text-align: center;
            z-index: 1;
        }
        
        .directory { color: #d2a8ff; } /* Keeping vibrant colors for file icons */
        .html-file { color: #e34c26; }
        .xml-file { color: #2ea043; }
        
        .tree-label {
            color: var(--text-light);
            text-decoration: none;
            cursor: pointer;
            z-index: 1;
            transition: color 0.2s;
        }
        
        a.tree-label:hover {
            color: var(--accent-primary);
        }
        
        .project-root {
            display: flex;
            align-items: center;
            padding: 10px;
            font-weight: 600;
            color: var(--text-light);
            border-bottom: 1px solid var(--glass-border);
            margin-bottom: 15px;
            gap: 12px;
            font-size: 1.05rem;
        }
        .project-root i {
            color: var(--accent-primary);
        }
        
        .build-subtitle {
            color: var(--text-muted);
            font-family: 'Fira Code', monospace;
            font-size: 0.9rem;
            text-align: center;
            margin-bottom: 40px;
        }
    </style>
</head>
<body>
    <!-- Utility Toggles -->
    <div class="utility-toggles">
        <button id="themeToggle" class="theme-toggle" aria-label="Toggle Dark Mode">
            <i class="fa-solid fa-moon"></i>
        </button>
    </div>

    <section class="blog-gallery-section" style="padding-top: 100px;">
        <div class="sitemap-wrapper">
            <div class="blog-section-header">
                <h2 class="blog-title">
                    <span class="blog-main-text" style="font-size: clamp(2rem, 5vw, 3.5rem);"><i class="fa-solid fa-sitemap" style="color: var(--accent-primary); margin-right: 15px;"></i>Project Architecture</span>
                    <span class="blog-ghost-text">Sitemap</span>
                </h2>
            </div>
            
            <div class="build-subtitle">Generated dynamically via build.js &bull; Directory Map</div>
            
            <div class="file-tree-container">
                <div class="project-root">
                    <i class="fa-solid fa-globe"></i> www.sudo.co.za
                </div>
                ${renderTreeBranch(fileTree, 0)}
            </div>
            
            <div style="text-align: center; margin-top: 60px;">
                <a href="/index.html" class="lets-talk-btn"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
            </div>
        </div>
    </section>

    <!-- Theme Toggle Logic -->
    <script>
        const themeToggleBtn = document.getElementById('themeToggle');
        
        // Initial check
        if (localStorage.getItem('portfolio-theme') === 'light') {
            document.body.setAttribute('data-theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
        
        themeToggleBtn.addEventListener('click', () => {
            if (document.body.getAttribute('data-theme') === 'light') {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('portfolio-theme', 'dark');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            } else {
                document.body.setAttribute('data-theme', 'light');
                localStorage.setItem('portfolio-theme', 'light');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }
        });
    </script>
</body>
</html>`;

try {
    fs.writeFileSync(SITEMAP_HTML_PATH, htmlContent, 'utf8');
    console.log('Successfully generated sitemap.html');
} catch (err) {
    console.error('Error generating sitemap.html:', err);
}

// ==========================================
// 8. Minify CSS & JS
// ==========================================
console.log('Starting minification process...');

async function minifyFiles() {
    const cssDir = path.join(__dirname, '../css');
    const cssMinDir = path.join(__dirname, '../css/min');
    const jsDir = path.join(__dirname, '../js');
    const jsMinDir = path.join(__dirname, '../js/min');

    // Minify CSS
    if (fs.existsSync(cssDir)) {
        if (!fs.existsSync(cssMinDir)) fs.mkdirSync(cssMinDir, { recursive: true });
        const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css') && !f.endsWith('.min.css') && fs.statSync(path.join(cssDir, f)).isFile());
        cssFiles.forEach(file => {
            const inputPath = path.join(cssDir, file);
            const minPath = path.join(cssMinDir, file.replace(/\.css$/, '.min.css'));
            try {
                const inputCss = fs.readFileSync(inputPath, 'utf8');
                const output = new CleanCSS({}).minify(inputCss);
                fs.writeFileSync(minPath, output.styles, 'utf8');
                console.log(`Minified CSS: ${file} -> css/min/${path.basename(minPath)}`);
            } catch (err) {
                console.error(`Error minifying ${file}:`, err);
            }
        });
    }

    // Minify JS
    if (fs.existsSync(jsDir)) {
        if (!fs.existsSync(jsMinDir)) fs.mkdirSync(jsMinDir, { recursive: true });
        const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && !f.endsWith('.min.js') && fs.statSync(path.join(jsDir, f)).isFile());
        for (const file of jsFiles) {
            const inputPath = path.join(jsDir, file);
            const minPath = path.join(jsMinDir, file.replace(/\.js$/, '.min.js'));
            try {
                const inputJs = fs.readFileSync(inputPath, 'utf8');
                const output = await terser.minify(inputJs, { module: file === 'index.js' });
                if (output.code) {
                    fs.writeFileSync(minPath, output.code, 'utf8');
                    console.log(`Minified JS: ${file} -> js/min/${path.basename(minPath)}`);
                }
            } catch (err) {
                console.error(`Error minifying ${file}:`, err);
            }
        }
    }
    console.log('Unified build process completed entirely.');
}

minifyFiles();
