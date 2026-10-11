const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const CleanCSS = require("clean-css");
const terser = require("terser");

// Configuration
const BASE_URL = "https://mr-sudo.dev"; // Adjust this when deploying
const ROOT_DIR = path.join(__dirname, "../");
const DATA_PATH = path.join(__dirname, "../data/blog.json");
const INDEX_PATH = path.join(__dirname, "../index.html");
const POST_TEMPLATE_PATH = path.join(
  __dirname,
  "../templates/post-template.html",
);
const PROJECTS_GALLERY_TEMPLATE_PATH = path.join(
  __dirname,
  "../templates/projects-gallery-template.html",
);
const SITEMAP_XML_TEMPLATE_PATH = path.join(
  __dirname,
  "../templates/sitemap-template.xml",
);
const SITEMAP_HTML_TEMPLATE_PATH = path.join(
  __dirname,
  "../templates/sitemap-template.html",
);
const SITEMAP_XML_PATH = path.join(__dirname, "../sitemap.xml");
const SITEMAP_HTML_PATH = path.join(__dirname, "../sitemap.html");
const POSTS_DIR = path.join(__dirname, "../posts");

// Cache Busting Version
const VERSION = Date.now();

console.log("Starting unified build process...");

// Utility to create URL-friendly slug
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// Track all generated pages for the sitemap
const sitePages = [
  "index.html",
  "about.html",
  "projects.html",
  "sitemap.html",
  "sitemap.xml",
  "404.html",
];

// 1. Read Data
let blogData = [];
try {
  const rawData = fs.readFileSync(DATA_PATH, "utf8");
  blogData = JSON.parse(rawData);
  console.log(`Loaded ${blogData.length} blog posts from data/blog.json`);
} catch (err) {
  console.error("Error reading data/blog.json:", err);
  process.exit(1);
}

// Dynamic Grid Generation for Index is now handled purely in index.js via client-side fetch.

// Re-add slug generation for blog paths
blogData = blogData.map((post) => {
  return {
    ...post,
    slug: createSlug(post.topic),
  };
});

blogData.forEach((post, index) => {
  post.link = `posts/${post.slug}.html`; // Used in archive, and sitemaps
  post.prevSlug = index > 0 ? blogData[index - 1].slug : null;
  post.nextSlug = index < blogData.length - 1 ? blogData[index + 1].slug : null;
});

// 4. Purge old directory and generate individual blog pages
if (fs.existsSync(POSTS_DIR)) {
  fs.rmSync(POSTS_DIR, { recursive: true, force: true });
  console.log("Purged old posts/ folder.");
}
fs.mkdirSync(POSTS_DIR, { recursive: true });

let templateBlock = "";
try {
  templateBlock = fs.readFileSync(POST_TEMPLATE_PATH, "utf8");
} catch (err) {
  console.error("Error reading post-template.html:", err);
  process.exit(1);
}

// Optional cleanup of old root pages: delete any blog-*.html in root
const rootFiles = fs.readdirSync(ROOT_DIR);
rootFiles.forEach((file) => {
  if (file.startsWith("blog-") && file.endsWith(".html")) {
    fs.unlinkSync(path.join(ROOT_DIR, file));
    console.log(`Deleted legacy root file: ${file}`);
  }
});

blogData.forEach((post) => {
  let pageHtml = templateBlock;
  pageHtml = pageHtml.replace(/{{TITLE}}/g, post.topic);
  pageHtml = pageHtml.replace(/{{DATE}}/g, post.date);
  pageHtml = pageHtml.replace(/{{CATEGORY}}/g, post.category || "Opinion");

  // Load Content from JSON directly
  let markedHtml = post.content || "<p>Content coming soon...</p>";

  pageHtml = pageHtml.replace(/{{CONTENT}}/g, markedHtml);

  // SEO Replacements
  const pageUrl = `${BASE_URL}/posts/${post.slug}.html`;
  const ogImage = post.image ? `${BASE_URL}/${post.image}` : "";
  const heroImage = post.image ? `../${post.image}` : "";
  const author = "Mosa Moleleki";

  let publishedDate = new Date().toISOString();
  try {
    if (post.date) publishedDate = new Date(post.date).toISOString();
  } catch (e) {}

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.topic,
    image: ogImage || `${BASE_URL}/my pictures/dark mode.webp`,
    author: {
      "@type": "Person",
      name: author,
      url: `${BASE_URL}/`,
    },
    publisher: {
      "@type": "Organization",
      name: "Mosa Moleleki",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/my pictures/dark mode.webp`,
      },
    },
    datePublished: publishedDate,
    description: post.description || "",
  };

  pageHtml = pageHtml.replace(/{{DESCRIPTION}}/g, post.description || "");
  pageHtml = pageHtml.replace(/{{AUTHOR}}/g, author);
  pageHtml = pageHtml.replace(/{{PAGE_URL}}/g, pageUrl);
  pageHtml = pageHtml.replace(/{{OG_IMAGE}}/g, ogImage);
  pageHtml = pageHtml.replace(/{{HERO_IMAGE}}/g, heroImage);
  pageHtml = pageHtml.replace(
    /{{JSON_LD}}/g,
    `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`,
  );

  // Cache Busting and Minified Paths replacement
  pageHtml = pageHtml.replace(
    /href="css\/style\.css"/g,
    `href="css/min/style.min.css?v=${VERSION}"`,
  );
  pageHtml = pageHtml.replace(
    /src="js\/index\.js"/g,
    `src="js/min/index.min.js?v=${VERSION}"`,
  );

  // Generic fallback: only append version to local asset paths (css/, js/, assets/)
  pageHtml = pageHtml.replace(/(href="(?:css|assets|js)\/[^"]*?\.css)"/g, `$1?v=${VERSION}"`);
  pageHtml = pageHtml.replace(/(src="(?:js|assets|css)\/[^"]*?\.js)"/g, `$1?v=${VERSION}"`);

  // Previous Link
  if (post.prevSlug) {
    pageHtml = pageHtml.replace(
      /{{PREV_LINK}}/g,
      `<a href="${post.prevSlug}.html" class="nav-btn">&larr; Previous</a>`,
    );
  } else {
    pageHtml = pageHtml.replace(
      /{{PREV_LINK}}/g,
      `<span class="nav-btn disabled">&larr; Previous</span>`,
    );
  }

  // Next Link
  if (post.nextSlug) {
    pageHtml = pageHtml.replace(
      /{{NEXT_LINK}}/g,
      `<a href="${post.nextSlug}.html" class="nav-btn">Next &rarr;</a>`,
    );
  } else {
    pageHtml = pageHtml.replace(
      /{{NEXT_LINK}}/g,
      `<span class="nav-btn disabled">Next &rarr;</span>`,
    );
  }

  const outputPath = path.join(POSTS_DIR, `${post.slug}.html`);
  fs.writeFileSync(outputPath, pageHtml, "utf8");
  console.log(`Generated page: ${post.link}`);

  // Track page for sitemaps
  if (!sitePages.includes(post.link)) {
    sitePages.push(post.link);
  }
});

// 5. Removed legacy blog.html generation (now handled centrally in index.html grid logic).
console.log("Blog generation complete!");

// ==========================================
// 6. Generate Project Pages
// ==========================================
console.log("Starting project pages generation...");
const PROJECTS_DATA_PATH = path.join(__dirname, "../data/projects.json");
const PROJECT_TEMPLATE_PATH = path.join(
  __dirname,
  "../templates/project-template.html",
);
const PROJECTS_OUT_DIR = path.join(__dirname, "../projects");

let projectsData = [];
try {
  const rawProjData = fs.readFileSync(PROJECTS_DATA_PATH, "utf8");
  projectsData = JSON.parse(rawProjData);
  console.log(`Loaded ${projectsData.length} projects from data/projects.json`);
} catch (err) {
  console.error("Error reading data/projects.json:", err);
}

// Add slug and links
projectsData = projectsData.map((proj) => {
  return {
    ...proj,
    slug: createSlug(proj.title),
  };
});

projectsData.forEach((proj, index) => {
  proj.link = `projects/${proj.slug}.html`;
  proj.prevSlug = index > 0 ? projectsData[index - 1].slug : null;
  proj.nextSlug =
    index < projectsData.length - 1 ? projectsData[index + 1].slug : null;
});

// Write the updated data back to projects.json so the client-side index.js picks up the correct links
try {
  fs.writeFileSync(
    PROJECTS_DATA_PATH,
    JSON.stringify(projectsData, null, 4),
    "utf8",
  );
  console.log("Updated data/projects.json with generated slugs and links.");
} catch (err) {
  console.error("Error writing to data/projects.json:", err);
}

if (fs.existsSync(PROJECTS_OUT_DIR)) {
  const files = fs.readdirSync(PROJECTS_OUT_DIR);
  files.forEach((file) => {
    if (file.endsWith(".html")) {
      fs.unlinkSync(path.join(PROJECTS_OUT_DIR, file));
    }
  });
  console.log("Purged old project HTML files.");
} else {
  fs.mkdirSync(PROJECTS_OUT_DIR, { recursive: true });
}

let projectTemplateBlock = "";
try {
  projectTemplateBlock = fs.readFileSync(PROJECT_TEMPLATE_PATH, "utf8");
} catch (err) {
  console.error("Error reading project-template.html:", err);
}

if (projectTemplateBlock && projectsData.length > 0) {
  projectsData.forEach((proj) => {
    let pageHtml = projectTemplateBlock;

    // Load Content
    let projContentHtml = proj.content || "";

    pageHtml = pageHtml.replace(/{{TITLE}}/g, proj.title || "");
    pageHtml = pageHtml.replace(/{{DESCRIPTION}}/g, proj.description || "");
    pageHtml = pageHtml.replace(/{{CATEGORY}}/g, proj.category || "");
    pageHtml = pageHtml.replace(/{{ROLE}}/g, proj.role || "");
    pageHtml = pageHtml.replace(/{{YEAR}}/g, proj.year || "");
    pageHtml = pageHtml.replace(/{{CONTENT}}/g, projContentHtml);

    const pageUrl = `${BASE_URL}/projects/${proj.slug}.html`;
    const ogImage = proj.fullImage.startsWith("http")
      ? proj.fullImage
      : `${BASE_URL}/${proj.fullImage}`;
    const displayImage =
      proj.fullImage && !proj.fullImage.startsWith("http")
        ? `../${proj.fullImage}`
        : proj.fullImage || "";

    pageHtml = pageHtml.replace(/{{PAGE_URL}}/g, pageUrl);
    pageHtml = pageHtml.replace(/{{OG_IMAGE}}/g, ogImage);
    pageHtml = pageHtml.replace(/{{FULL_IMAGE}}/g, displayImage);

    // Links
    let liveLinkHtml =
      proj.liveLink && proj.liveLink !== "#"
        ? `<a href="${proj.liveLink}" target="_blank" rel="noopener noreferrer" class="lets-talk-btn"><span>Live Demo</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>`
        : "";
    let githubLinkHtml =
      proj.githubLink && proj.githubLink !== "#"
        ? `<a href="${proj.githubLink}" target="_blank" rel="noopener noreferrer" class="lets-talk-btn"><span>GitHub Repo</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>`
        : "";
    pageHtml = pageHtml.replace(/{{LIVE_LINK_HTML}}/g, liveLinkHtml);
    pageHtml = pageHtml.replace(/{{GITHUB_LINK_HTML}}/g, githubLinkHtml);

    // Technologies
    let techHtml = (proj.technologies || [])
      .map((tech) => `<span class="tech-pill">${tech}</span>`)
      .join("\n                ");
    pageHtml = pageHtml.replace(/{{TECHNOLOGIES_HTML}}/g, techHtml);

    // Overview Details with fallbacks
    let overviewDetailsHtml = "";
    const roleStr =
      proj.overviewDetails && proj.overviewDetails.myRole
        ? proj.overviewDetails.myRole
        : proj.role || "";
    const durStr =
      proj.overviewDetails && proj.overviewDetails.duration
        ? proj.overviewDetails.duration
        : proj.year || "";
    const teamStr =
      proj.overviewDetails && proj.overviewDetails.teamSize
        ? proj.overviewDetails.teamSize
        : "";
    const platStr =
      proj.overviewDetails && proj.overviewDetails.platform
        ? proj.overviewDetails.platform
        : proj.category || "";

    overviewDetailsHtml = `
            <div class="overview-details-grid">
                ${roleStr ? `<div class="detail-item"><span class="detail-label">Role</span><span class="detail-val">${roleStr}</span></div>` : ""}
                ${durStr ? `<div class="detail-item"><span class="detail-label">Timeline</span><span class="detail-val">${durStr}</span></div>` : ""}
                ${teamStr ? `<div class="detail-item"><span class="detail-label">Team</span><span class="detail-val">${teamStr}</span></div>` : ""}
                ${platStr ? `<div class="detail-item"><span class="detail-label">Platform</span><span class="detail-val">${platStr}</span></div>` : ""}
            </div>`;
    pageHtml = pageHtml.replace(
      /{{OVERVIEW_DETAILS_HTML}}/g,
      overviewDetailsHtml,
    );

    // Cache Busting and Minified Paths replacement
    pageHtml = pageHtml.replace(
      /href="\.\.\/css\/style\.css"/g,
      `href="../css/min/style.min.css?v=${VERSION}"`,
    );
    pageHtml = pageHtml.replace(
      /src="\.\.\/js\/index\.js"/g,
      `src="../js/min/index.min.js?v=${VERSION}"`,
    );

    // Generic fallback: only append version to local asset paths (handling ../ prefixes)
    pageHtml = pageHtml.replace(/(href="\.\.\/(?:css|assets|js)\/[^"]*?\.css)"/g, `$1?v=${VERSION}"`);
    pageHtml = pageHtml.replace(/(src="\.\.\/(?:js|assets|css)\/[^"]*?\.js)"/g, `$1?v=${VERSION}"`);

    // Metrics
    let metricsHtml = "";
    if (proj.metrics && proj.metrics.length > 0) {
      metricsHtml = `
                <section class="project-metrics-section fade-element">
                    <div class="metrics-grid">
                        ${proj.metrics
                          .map(
                            (m) => `
                            <div class="metric-card">
                                <h3 class="metric-val text-primary">
                                    <span class="val-main">${m.value}</span>
                                    <span class="val-ghost">${m.value}</span>
                                </h3>
                                <p class="metric-label">${m.label}</p>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </section>`;
    }
    pageHtml = pageHtml.replace(/{{METRICS_HTML}}/g, metricsHtml);

    // Features Section
    let featuresHtml = "";
    if (proj.keyFeatures && proj.keyFeatures.length > 0) {
      featuresHtml = `
                <section id="key-features" class="project-features-section fade-element">
                    <div class="project-section-header">
                        <h2 class="section-title">
                            <span class="title-main">Key Features</span>
                            <span class="title-ghost">Features</span>
                        </h2>
                    </div>
                    <ul class="results-list">
                        ${proj.keyFeatures.map((f) => `<li>${f}</li>`).join("\n")}
                    </ul>
                </section>`;
    }
    pageHtml = pageHtml.replace(/{{FEATURES_HTML}}/g, featuresHtml);

    // Videos Showcase
    let videosHtml = "";
    if (proj.videos && proj.videos.length > 0) {
      videosHtml = `
                <section id="in-motion" class="project-videos-section fade-element">
                    <div class="project-section-header">
                        <h2 class="section-title">
                            <span class="title-main">In Motion</span>
                            <span class="title-ghost">Motion</span>
                        </h2>
                    </div>
                    <div class="videos-container">
                        ${proj.videos
                          .map(
                            (v) => `
                            <div class="video-wrapper premium-media-container">
                                <video src="../${v.src}" autoplay loop muted playsinline class="project-video"></video>
                            </div>
                        `,
                          )
                          .join("\n")}
                    </div>
                </section>`;
    }
    pageHtml = pageHtml.replace(/{{VIDEOS_HTML}}/g, videosHtml);

    // Gallery
    let galleryHtml = "";
    if (proj.gallery && proj.gallery.length > 0) {
      galleryHtml = `
                <section id="visuals" class="project-gallery-section fade-element">
                    <div class="project-section-header">
                        <h2 class="section-title" id="visuals-heading">
                            <span class="title-main">Visuals</span>
                            <span class="title-ghost">Gallery</span>
                        </h2>
                    </div>
                    <div class="awwwards-bento-gallery">
                        ${proj.gallery
                          .map((img, index) => {
                            const cleanPath = img.replace("../projects/", "");
                            const bentoClass = index % 3 === 0 ? 'bento-large' : 'bento-small';
                            return `
                            <div class="bento-item ${bentoClass} glow-card">
                                <div class="bento-image-wrapper">
                                    <img src="${cleanPath}" alt="Gallery Visual ${index + 1}" loading="lazy">
                                    <div class="bento-overlay">
                                        <i data-lucide="eye"></i>
                                    </div>
                                </div>
                            </div>`;
                          })
                          .join("")}
                    </div>
                </section>`;
    }
    pageHtml = pageHtml.replace(/{{GALLERY_HTML}}/g, galleryHtml);

    // Quote removed by user request
    pageHtml = pageHtml.replace(/{{QUOTE_HTML}}/g, "");

    // Learnings
    let learningsHtml = "";
    if (proj.learnings && proj.learnings.length > 0) {
      learningsHtml = `
                <section id="key-takeaways" class="project-learnings-section cinematic-section fade-element">
                    <div class="cinematic-inner">
                        <div class="project-section-header">
                            <span class="methodology-eyebrow">KEY TAKEAWAYS</span>
                            <h2 class="section-title">
                                <span class="title-main">Key Takeaways</span>
                                <span class="title-ghost">Insights</span>
                            </h2>
                        </div>
                        <div class="glossy-cards-grid">
                            ${proj.learnings.map((l) => `
                                <div class="glossy-card">
                                    <div class="glossy-card-icon"><i data-lucide="check-circle"></i></div>
                                    <p>${l}</p>
                                </div>`).join("")}
                        </div>
                    </div>
                </section>`;
    }
    pageHtml = pageHtml.replace(/{{LEARNINGS_HTML}}/g, learningsHtml);

    // 2. Visual Evolution (Before / After Slider)
    let beforeAfterHtml = "";
    if (proj.beforeAfter) {
      beforeAfterHtml = `
                <section id="visual-evolution" class="project-visual-comparison fade-element">
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
                                    <i data-lucide="arrow-left-right"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>`;
    }
    pageHtml = pageHtml.replace(/{{BEFORE_AFTER_HTML}}/g, beforeAfterHtml);

    // Responsive Views Showcase
    let responsiveHtml = "";
    if (proj.responsiveViews) {
      responsiveHtml = `
                <section id="responsive-design" class="project-responsive-section fade-element">
                    <div class="project-section-header">
                        <h2 class="section-title">
                            <span class="title-main">Responsive Design</span>
                            <span class="title-ghost">Devices</span>
                        </h2>
                    </div>
                    <p class="section-desc">A seamless experience across desktop, tablet, and mobile devices.</p>
                    <div class="responsive-showcase">
                        <div class="responsive-frames">
                            ${proj.responsiveViews.desktop ? `<div class="device-frame desktop-frame"><img src="../${proj.responsiveViews.desktop}" alt="Desktop View"></div>` : ""}
                            ${proj.responsiveViews.tablet ? `<div class="device-frame tablet-frame"><img src="../${proj.responsiveViews.tablet}" alt="Tablet View"></div>` : ""}
                            ${proj.responsiveViews.mobile ? `<div class="device-frame mobile-frame"><img src="../${proj.responsiveViews.mobile}" alt="Mobile View"></div>` : ""}
                        </div>
                    </div>
                </section>`;
    }
    pageHtml = pageHtml.replace(/{{RESPONSIVE_VIEWS_HTML}}/g, responsiveHtml);

    // 3. Technical Challenges
    let challengesHtml = "";
    if (proj.challengesStructured && proj.challengesStructured.length > 0) {
      challengesHtml = `
                <section id="technical-challenges" class="project-challenges-section fade-element">
                    <div class="project-section-header">
                        <h2 class="section-title">
                            <span class="title-main">Technical Challenges</span>
                            <span class="title-ghost">Core</span>
                        </h2>
                    </div>
                    <div class="challenges-grid">
                        ${proj.challengesStructured
                          .map(
                            (ch) => `
                            <div class="challenge-pair">
                                <div class="challenge-side">
                                    <span class="side-label issue">The Problem</span>
                                    <p>${ch.issue}</p>
                                </div>
                                <div class="solution-side">
                                    <span class="side-label solution">The Solution</span>
                                    <p>${ch.solution}</p>
                                </div>
                            </div>`,
                          )
                          .join("\n")}
                    </div>
                </section>`;
    }
    pageHtml = pageHtml.replace(/{{CHALLENGES_HTML}}/g, challengesHtml);

    // 4. Project Outcomes
    let resultsHtml = `
            <section id="outcomes" class="project-results-section cinematic-section fade-element">
                <div class="cinematic-inner">
                    <div class="project-section-header">
                        <span class="methodology-eyebrow">PROJECT IMPACT</span>
                        <h2 class="section-title">
                            <span class="title-main">Project Outcomes</span>
                            <span class="title-ghost">Impact</span>
                        </h2>
                    </div>
                    <div class="glossy-cards-grid">
                        ${(proj.outcomes || []).map((res) => `
                            <div class="glossy-card highlight-card">
                                <div class="glossy-card-icon"><i data-lucide="zap"></i></div>
                                <p>${res}</p>
                            </div>`).join("")}
                    </div>
                </div>
            </section>`;
    pageHtml = pageHtml.replace(/{{RESULTS_HTML}}/g, resultsHtml);

    // Prev / Next Links
    if (proj.prevSlug) {
      let prevProj = projectsData.find((p) => p.slug === proj.prevSlug);
      pageHtml = pageHtml.replace(
        /{{PREV_LINK}}/g,
        `<a href="${proj.prevSlug}.html" class="nav-direction-btn prev-btn"><span class="direction-label">Previous</span><span class="target-title">${prevProj.title}</span></a>`,
      );
    } else {
      pageHtml = pageHtml.replace(/{{PREV_LINK}}/g, `<div></div>`);
    }

    if (proj.nextSlug) {
      let nextProj = projectsData.find((p) => p.slug === proj.nextSlug);
      pageHtml = pageHtml.replace(
        /{{NEXT_LINK}}/g,
        `<a href="${proj.nextSlug}.html" class="nav-direction-btn next-btn"><span class="direction-label">Next</span><span class="target-title">${nextProj.title}</span></a>`,
      );
    } else {
      pageHtml = pageHtml.replace(/{{NEXT_LINK}}/g, `<div></div>`);
    }

    const outputPath = path.join(PROJECTS_OUT_DIR, `${proj.slug}.html`);
    fs.writeFileSync(outputPath, pageHtml, "utf8");
    console.log(`Generated project page: ${proj.link}`);

    if (!sitePages.includes(proj.link)) {
      sitePages.push(proj.link);
    }
  });
}
console.log("Project generation complete!");

// ==========================================
// 6.5 Generate Project Cards for Index & Gallery
// ==========================================
console.log("Starting project cards generation for Index and Gallery...");

let indexProjectsHTML = "\n";
let allProjectsCardsHTML = "\n";

// For index.html, we only want the first 3 projects
const indexProjects = projectsData.slice(0, 3);

function generateProjectCard(proj, isGallery = false) {
  const techPills = (proj.technologies || [])
    .slice(0, 4)
    .map((tech) => `<span class="project-row-pill">${tech}</span>`)
    .join("");

  const thumbDark = (proj.thumbnail && proj.thumbnail.dark ? proj.thumbnail.dark : "").replace(/^\.\.\//, "");
  const thumbLight = (proj.thumbnail && proj.thumbnail.light ? proj.thumbnail.light : "").replace(/^\.\.\//, "");

  // We use the same structure as the dynamic rendering but as static HTML
  return `
                <div class="project-row glow-card" data-index="${proj.id}">
                    <div class="project-row-img-container">
                        <img src="${thumbDark}" alt="${proj.title}" class="project-row-img" data-light="${thumbLight}" data-dark="${thumbDark}" loading="lazy">
                        ${proj.desktopVideoUrl ? `<video class="project-row-video" src="${proj.desktopVideoUrl}" muted loop playsinline></video>` : ""}
                    </div>
                    <div class="project-row-content">
                        <h3 class="project-row-title">${proj.title}</h3>
                        <div class="project-row-meta">
                            <div class="project-row-tech">
                                ${techPills}
                            </div>
                            <span class="project-row-category">${proj.category || ""}</span>
                        </div>
                        <p class="project-row-desc">${proj.description}</p>
                        <div class="project-row-actions">
                            <a href="${proj.link}" class="lets-talk-btn">
                                <span>Learn More</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </a>
                            ${proj.githubLink && proj.githubLink !== "#" ? `
                            <a href="${proj.githubLink}" class="lets-talk-btn" target="_blank" rel="noopener noreferrer">
                                <span>View Source</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </a>` : ""}
                        </div>
                    </div>
                </div>`;
}

indexProjects.forEach((proj) => {
  indexProjectsHTML += generateProjectCard(proj);
});

projectsData.forEach((proj) => {
  allProjectsCardsHTML += generateProjectCard(proj, true);
});

// Inject into index.html
try {
  let indexData = fs.readFileSync(INDEX_PATH, "utf8");
  const startTag = "<!-- PROJECTS_START -->";
  const endTag = "<!-- PROJECTS_END -->";

  const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`, "g");
  const replacement = `${startTag}${indexProjectsHTML}${endTag}`;

  if (regex.test(indexData)) {
    indexData = indexData.replace(regex, replacement);
    fs.writeFileSync(INDEX_PATH, indexData, "utf8");
    console.log("Successfully injected project cards into index.html");
  } else {
    console.error(
      "Could not find PROJECTS_START/END injection markers in index.html!",
    );
  }
} catch (err) {
  console.error("Error processing projects in index.html:", err);
}

// Generate projects.html (Gallery Page)
try {
  let projectGalleryTemplate = fs.readFileSync(
    PROJECTS_GALLERY_TEMPLATE_PATH,
    "utf8",
  );
  projectGalleryTemplate = projectGalleryTemplate.replace(
    /{{ALL_PROJECTS_CARDS_HTML}}/g,
    allProjectsCardsHTML,
  );
  projectGalleryTemplate = projectGalleryTemplate.replace(
    /{{VERSION}}/g,
    VERSION,
  );

  fs.writeFileSync(
    path.join(ROOT_DIR, "projects.html"),
    projectGalleryTemplate,
    "utf8",
  );
  console.log("Successfully generated projects.html");
  if (!sitePages.includes("projects.html")) {
    sitePages.push("projects.html");
  }
} catch (err) {
  console.error("Error generating projects.html:", err);
}

// 7. Generate sitemap.xml
try {
  let xmlContent = fs.readFileSync(SITEMAP_XML_TEMPLATE_PATH, "utf8");
  let urlSetHtml = "";
  sitePages.forEach((page) => {
    if (page === "404.html" || page.endsWith(".xml")) return;
    const loc = `${BASE_URL}/${page}`;
    urlSetHtml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n  </url>\n`;
  });
  xmlContent = xmlContent.replace(/{{URL_SET_HTML}}/g, urlSetHtml);

  fs.writeFileSync(SITEMAP_XML_PATH, xmlContent, "utf8");
  console.log("Successfully generated sitemap.xml");
} catch (err) {
  console.error("Error generating sitemap.xml:", err);
}

// 6. Generate sitemap.html
// First, build a tree structure from the paths
const fileTree = {};
sitePages.forEach((page) => {
  // If it's the root site, page is 'index.html'
  const parts = page.split("/");
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

    html += `  <li class="tree-item ${isLast ? "is-last" : ""}">\n`;
    html += `    <div class="tree-row">\n`;
    html += `      <span class="tree-line"></span>\n`;

    if (hasChildren) {
      html += `      <div class="tree-node-left">\n`;
      html += `        <i data-lucide="folder" class="tree-icon directory"></i>\n`;
      html += `        <span class="tree-label directory-label">${key}/</span>\n`;
      html += `      </div>\n`;
      html += `      <div class="tree-node-right">\n`;
      html += `        <span class="tree-badge dir-badge">DIRECTORY</span>\n`;
      html += `      </div>\n`;
      html += `    </div>\n`;
      html += renderTreeBranch(item._children, level + 1);
    } else {
      const ext = key.split(".").pop();
      let iconName = "file-text";
      let typeLabel = "PAGE";
      let badgeClass = "html-badge";
      if (ext === "xml") {
        iconName = "rss";
        typeLabel = "FEED";
        badgeClass = "xml-badge";
      } else if (item._path.startsWith("projects/")) {
        iconName = "layers";
        typeLabel = "CASE STUDY";
      } else if (item._path.startsWith("posts/")) {
        iconName = "book-open";
        typeLabel = "ARTICLE";
      } else if (item._path === "404.html") {
        iconName = "alert-circle";
        typeLabel = "EXCEPTION";
      }

      html += `      <div class="tree-node-left">\n`;
      html += `        <i data-lucide="${iconName}" class="tree-icon ${ext}-file"></i>\n`;
      html += `        <a href="${item._path}" class="tree-label" data-route-path="${item._path}">${key}</a>\n`;
      html += `      </div>\n`;
      html += `      <div class="tree-node-right">\n`;
      html += `        <span class="tree-route-path">/${item._path}</span>\n`;
      html += `        <span class="tree-badge ${badgeClass}">${typeLabel}</span>\n`;
      html += `        <a href="${item._path}" class="tree-visit-btn" aria-label="Visit ${key}">\n`;
      html += `          <i data-lucide="arrow-up-right"></i>\n`;
      html += `        </a>\n`;
      html += `      </div>\n`;
      html += `    </div>\n`;
    }
    html += `  </li>\n`;
  });
  html += "</ul>\n";
  return html;
}

try {
  let sitemapHtmlTemplate = fs.readFileSync(SITEMAP_HTML_TEMPLATE_PATH, "utf8");
  sitemapHtmlTemplate = sitemapHtmlTemplate.replace(
    /{{FILE_TREE_HTML}}/g,
    renderTreeBranch(fileTree, 0),
  );
  sitemapHtmlTemplate = sitemapHtmlTemplate.replace(/{{VERSION}}/g, VERSION);

  fs.writeFileSync(SITEMAP_HTML_PATH, sitemapHtmlTemplate, "utf8");
  console.log("Successfully generated sitemap.html");
} catch (err) {
  console.error("Error generating sitemap.html:", err);
}

// ==========================================
// 8. Minify CSS & JS
// ==========================================
console.log("Starting minification process...");

async function minifyFiles() {
  const cssDir = path.join(__dirname, "../css");
  const cssMinDir = path.join(__dirname, "../css/min");
  const jsDir = path.join(__dirname, "../js");
  const jsMinDir = path.join(__dirname, "../js/min");

  // Minify CSS
  if (fs.existsSync(cssDir)) {
    if (!fs.existsSync(cssMinDir)) fs.mkdirSync(cssMinDir, { recursive: true });
    const cssFiles = fs
      .readdirSync(cssDir)
      .filter(
        (f) =>
          f.endsWith(".css") &&
          !f.endsWith(".min.css") &&
          fs.statSync(path.join(cssDir, f)).isFile(),
      );
    cssFiles.forEach((file) => {
      const inputPath = path.join(cssDir, file);
      const minPath = path.join(cssMinDir, file.replace(/\.css$/, ".min.css"));
      try {
        const options = {
          rebase: false,
          inline: ["local"], // Inline local imports
        };
        // Special case for style.css to ensure it resolves imports relative to css dir
        const cleaner = new CleanCSS({
          ...options,
          inlineRequest: {
            hostname: "localhost", // dummy for local files
          },
          rebaseTo: cssDir,
        });

        const inputCss = fs.readFileSync(inputPath, "utf8");
        // We tell clean-css the path of the file so it can resolve @import
        const output = cleaner.minify({
          [inputPath]: {
            styles: inputCss,
          },
        });

        if (output.errors.length > 0) {
          console.error(`Errors minifying ${file}:`, output.errors);
        }
        if (output.warnings.length > 0) {
          console.warn(`Warnings minifying ${file}:`, output.warnings);
        }

        fs.writeFileSync(minPath, output.styles, "utf8");
        console.log(
          `Minified CSS: ${file} -> css/min/${path.basename(minPath)}`,
        );
      } catch (err) {
        console.error(`Error minifying ${file}:`, err);
      }
    });
  }

  // Handle asset replacement for ALL HTML files in the project
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
  findHtmlFiles(path.join(__dirname, "../"));

  htmlFiles.forEach((htmlPath) => {
    try {
      let content = fs.readFileSync(htmlPath, "utf8");

      // 1. Rename Font Awesome
      content = content.replace(/all\.min\.css/g, "font-awesome.min.css");
      content = content.replace(/https:\/\/unpkg\.com\/lucide@latest/g, "https://unpkg.com/lucide@0.460.0");
      content = content.replace(/data-lucide="magnifying-glass"/g, 'data-lucide="search"');
      content = content.replace(/data-lucide="circle-xmark"/g, 'data-lucide="x-circle"');
      content = content.replace(/data-lucide="earth-africa"/g, 'data-lucide="globe"');
      content = content.replace(/data-lucide="arrows-spin"/g, 'data-lucide="refresh-cw"');
      content = content.replace(/data-lucide="bolt"/g, 'data-lucide="zap"');

      // 1.5 Inject Global Footer & Ensure Footer Stylesheet
      const isRoot = path.resolve(path.dirname(htmlPath)) === path.resolve(__dirname, "../");
      const prefix = isRoot ? "" : "../";
      
      const footerTemplatePath = path.join(__dirname, "../templates/footer-template.html");
      if (fs.existsSync(footerTemplatePath)) {
          let footerTemplate = fs.readFileSync(footerTemplatePath, "utf8");
          footerTemplate = footerTemplate.replace(/{{BASE_URL}}/g, prefix);
          
          const footerRegex = /<!-- INJECT_GLOBAL_FOOTER -->|(?:[ \t]*<!--[ \t]*={5,}[ \t]*-->\s*)*[ \t]*<!--[ \t]*Site Footer[^\n]*-->\s*(?:[ \t]*<!--[ \t]*={5,}[ \t]*-->\s*)*<footer class="site-footer-v2" id="siteFooter"[\s\S]*?<\/footer>|<footer class="site-footer-v2" id="siteFooter"[\s\S]*?<\/footer>|<footer class="site-footer(?:-v2)?"[\s\S]*?<\/footer>/gi;
          if (footerRegex.test(content)) {
              content = content.replace(footerRegex, footerTemplate);
          } else {
              if (content.includes('<button class="back-to-top"')) {
                  content = content.replace('<button class="back-to-top"', `${footerTemplate}\n\n    <button class="back-to-top"`);
              } else if (content.includes('</body>')) {
                  content = content.replace('</body>', `${footerTemplate}\n</body>`);
              }
          }
      }

      // Ensure footer.min.css is included in <head>
      if (!content.includes('footer.min.css') && !content.includes('footer.css')) {
          content = content.replace('</head>', `    <link rel="stylesheet" href="${prefix}css/min/footer.min.css?v=${VERSION}" />\n</head>`);
      }

      // 2. Resolve relative paths for CSS/JS replacements

      // Replace minified CSS with versioned versions
      const styleRegex = new RegExp(`href="${prefix}css/min/(style|footer|blog-grid|project|about|sitemap)\\.min\\.css(?:\\?v=\\d+)?"`, "g");
      content = content.replace(
        styleRegex,
        `href="${prefix}css/min/$1.min.css?v=${VERSION}"`,
      );

      // Update theme.js and index.js versioning
      const themeRegex = new RegExp(
        `src="${prefix}js/min/theme\\.min\\.js(\\?v=\\d+)?"`,
        "g",
      );
      content = content.replace(
        themeRegex,
        `src="${prefix}js/min/theme.min.js?v=${VERSION}"`,
      );

      const indexRegex = new RegExp(`src="${prefix}js/index\\.js"`, "g");
      content = content.replace(
        indexRegex,
        `src="${prefix}js/min/index.min.js?v=${VERSION}"`,
      );

      fs.writeFileSync(htmlPath, content, "utf8");
      console.log(
        `Updated assets in: ${path.relative(path.join(__dirname, "../"), htmlPath)}`,
      );
    } catch (err) {
      console.error(`Error updating ${htmlPath}:`, err);
    }
  });

  // Minify JS
  if (fs.existsSync(jsDir)) {
    if (!fs.existsSync(jsMinDir)) fs.mkdirSync(jsMinDir, { recursive: true });
    const jsFiles = fs
      .readdirSync(jsDir)
      .filter(
        (f) =>
          f.endsWith(".js") &&
          !f.endsWith(".min.js") &&
          fs.statSync(path.join(jsDir, f)).isFile(),
      );
    for (const file of jsFiles) {
      const inputPath = path.join(jsDir, file);
      const minPath = path.join(jsMinDir, file.replace(/\.js$/, ".min.js"));
      try {
        const inputJs = fs.readFileSync(inputPath, "utf8");
        const output = await terser.minify(inputJs, {
          module: file === "index.js",
        });
        if (output.code) {
          fs.writeFileSync(minPath, output.code, "utf8");
          console.log(
            `Minified JS: ${file} -> js/min/${path.basename(minPath)}`,
          );
        }
      } catch (err) {
        console.error(`Error minifying ${file}:`, err);
      }
    }
  }
  console.log("Unified build process completed entirely.");
}

minifyFiles();
