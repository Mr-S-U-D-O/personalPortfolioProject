// =========================================================================
// INITIALIZATION & WARNINGS
// =========================================================================
(console.log(
  "%c⚠ STOP!",
  "color: #ff4444; font-size: 2rem; font-weight: 900; text-shadow: 0 0 8px #ff4444;",
),
  console.log(
    "%cThis is a proprietary, privately-owned portfolio.\n\nAll source code, design, and assets are copyright © 2024–2026 Mosa Moleleki.\nUnauthorised copying, cloning, or reproduction is strictly prohibited.\n\nTo request permission: Molelekishoez@gmail.com\nLicense: https://github.com/Mr-S-U-D-O/personalPortfolioProject/blob/main/LICENSE",
    "color: #ffffff; font-size: 0.9rem; line-height: 1.8; background: #111; padding: 12px 16px; border-left: 4px solid #ff4444; border-radius: 4px;",
  ));
// =========================================================================
// DOM ELEMENTS
// =========================================================================
const i = document.getElementById("splashScreen"),
  a = document.getElementById("quoteContainer"),
  l = document.getElementById("heroSection");

let k = !1;
// =========================================================================
// INTRO ANIMATION & INITIALIZATION ROUTINE (QUOTE DIRECT START)
// =========================================================================
const z = () => {
  if (k) return;
  k = !0;

  // 1. Determine if we are on the homepage
  const isHomePage =
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("index.html");

  if (!isHomePage) {
    if (i) i.style.display = "none";
    if (l) l.classList.add("show");
    document.getElementById("globalUi")?.classList.add("show");
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
    return;
  }

  // 2. Logic to decide whether to show animation or skip it
  const shouldSkipAnimation = (() => {
    const navEntries = performance.getEntriesByType("navigation");
    const navType = navEntries.length > 0 ? navEntries[0].type : "";

    const isReload =
      navType === "reload" ||
      (window.performance &&
        window.performance.navigation &&
        window.performance.navigation.type === 1);
    const isBackForward =
      navType === "back_forward" ||
      (window.performance &&
        window.performance.navigation &&
        window.performance.navigation.type === 2);

    const introPlayed = sessionStorage.getItem("introPlayed") === "true";
    const hasHash = !!window.location.hash;

    if (isBackForward) return true;
    if (isReload && hasHash) return true;
    if (introPlayed && !isReload) return true;

    return false;
  })();

  if (shouldSkipAnimation) {
    if (a) a.style.display = "none";
    if (i) i.style.display = "none";
    if (l) l.classList.add("show");
    document.getElementById("globalUi")?.classList.add("show");
    document.documentElement.style.overflowY = "auto";
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowY = "auto";
    document.body.style.overflowX = "hidden";

    if (window.location.hash) {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        target?.scrollIntoView();
        refreshScrollAnims();
      }, 100);
    } else {
      refreshScrollAnims();
    }
  } else {
    // Show splash screen and start directly with the quote
    sessionStorage.setItem("introPlayed", "true");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      if (a) a.classList.add("show");

      // Allow readable pause on quote before transition into hero
      setTimeout(() => {
        if (a) a.classList.add("zoom-into");
        setTimeout(() => {
          if (l) l.classList.add("show");
          document.getElementById("globalUi")?.classList.add("show");
          document.documentElement.style.overflowY = "auto";
          document.documentElement.style.overflowX = "hidden";
          document.body.style.overflowY = "auto";
          document.body.style.overflowX = "hidden";
          document.documentElement.style.height = "auto";
          document.body.style.height = "auto";

          refreshScrollAnims();
          setTimeout(() => {
            if (i) i.style.display = "none";
          }, 600);
        }, 600);
      }, 2800);
    }, 200);
  }
};

// =========================================================================
// GLOBAL EVENT LISTENERS & RESIZE HANDLING
// =========================================================================
document.addEventListener("readystatechange", (e) => {
  if (e.target.readyState === "complete") z();
});
if (document.readyState === "complete") z();

(function () {
  const e = document.getElementById("dynamicGreeting");
  if (!e) return;
  const t = new Date().getHours();
  let o = "Good evening";
  if (t >= 5 && t < 12) {
    o = "Good morning";
  } else if (t >= 12 && t < 18) {
    o = "Good afternoon";
  }
  e.textContent = o;
})();
// =========================================================================
// UI INTERACTIONS (BLUR, NAV, TOOLTIPS)
// =========================================================================
const q = document.getElementById("blurOverlay"),
  T = document.querySelector(".sidebar-nav");
document.querySelector(".tech-carousel-wrapper");
function A() {
  q && q.classList.add("active");
}
function P() {
  q && q.classList.remove("active");
}
T && (T.addEventListener("mouseenter", A), T.addEventListener("mouseleave", P));
const O = document.querySelector(".tech-track");
O &&
  (O.addEventListener("mouseenter", () => {
    O.getAnimations().forEach((e) => (e.playbackRate = 0.2));
  }),
  O.addEventListener("mouseleave", () => {
    O.getAnimations().forEach((e) => (e.playbackRate = 1));
  }));
const j = document.getElementById("globalTooltip"),
  R = document.getElementById("globalTooltipText"),
  X = document.querySelectorAll(".tech-item");
j &&
  X.length > 0 &&
  X.forEach((e) => {
    (e.addEventListener("mouseenter", () => {
      const t = e.getAttribute("data-tooltip");
      if (t) {
        ((R.textContent = t), j.classList.add("visible"));
        const o = e.getBoundingClientRect();
        ((j.style.top = o.top - 10 + "px"),
          (j.style.left = o.left + o.width / 2 + "px"));
      }
    }),
      e.addEventListener("mouseleave", () => {
        j.classList.remove("visible");
      }));
  });
const F = document.querySelector(".cv-nav");
if (F) {
  F.addEventListener("mouseenter", A);
  F.addEventListener("mouseleave", P);
}

document.addEventListener("themechange", (e) => {
  const t = e.detail.theme;
  const o = document.querySelector(".hero-profile-img");
  if (o) {
    o.src = t === "light" ? "my pictures/light mode.webp" : "my pictures/dark mode.webp";
  }
  document.querySelectorAll("[data-light]").forEach((el) => {
    const targetSrc = t === "light" ? el.getAttribute("data-light") : el.getAttribute("data-dark");
    if (targetSrc) {
      if (el.tagName === "IMG") {
        el.src = targetSrc;
      } else {
        el.style.backgroundImage = `url('${targetSrc}')`;
      }
    }
  });
});

const N = document.documentElement.getAttribute("data-theme") || "dark";
const Y = document.querySelector(".hero-profile-img");
if (Y) {
  Y.src = N === "light" ? "my pictures/light mode.webp" : "my pictures/dark mode.webp";
}
document.querySelectorAll("[data-light]").forEach((el) => {
  const targetSrc = N === "light" ? el.getAttribute("data-light") : el.getAttribute("data-dark");
  if (targetSrc) {
    if (el.tagName === "IMG") {
      el.src = targetSrc;
    } else {
      el.style.backgroundImage = `url('${targetSrc}')`;
    }
  }
});
// =========================================================================
// SCROLL ANIMATIONS (TIMELINE SNAKE FILL)
// =========================================================================
// Reusable function to update all scroll-based animations
const refreshScrollAnims = () => {

    const midPoint = window.innerHeight / 2;
    const timelineNodes = document.querySelectorAll(".st-node, .st-turn");
    
    timelineNodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const relativeProgress = (midPoint + 50 - rect.top) / rect.height;
      const fillProgress = Math.max(0, Math.min(1, relativeProgress));
      
      if (node.classList.contains("st-node")) {
        const fill = node.querySelector(".st-v .st-fill");
        if (fill) fill.style.transform = `scaleY(${fillProgress})`;
        
        const dot = node.querySelector(".st-dot");
        const content = node.querySelector(".st-content");
        
        if (relativeProgress >= 0.5) {
          if (dot) dot.classList.add("filled");
          if (content) content.classList.add("visible");
        } else {
          if (dot) dot.classList.remove("filled");
          if (content) content.classList.remove("visible");
        }
      } else if (node.classList.contains("st-turn")) {
        const topFill = node.querySelector(".st-top-left .st-fill") || node.querySelector(".st-top-right .st-fill");
        const horizontalFill = node.querySelector(".st-h .st-fill");
        const bottomFill = node.querySelector(".st-bottom-right .st-fill") || node.querySelector(".st-bottom-left .st-fill");
        
        let topSection = Math.max(0, Math.min(1, fillProgress / 0.2));
        let midSection = Math.max(0, Math.min(1, (fillProgress - 0.2) / 0.6));
        let botSection = Math.max(0, Math.min(1, (fillProgress - 0.8) / 0.2));
        
        if (topFill) topFill.style.transform = `scaleY(${topSection})`;
        if (horizontalFill) horizontalFill.style.transform = `scaleX(${midSection})`;
        if (bottomFill) bottomFill.style.transform = `scaleY(${botSection})`;
      }
    });
};

// Handle bfcache restoration
window.addEventListener("pageshow", () => {
    refreshScrollAnims();
});

window.addEventListener("scroll", refreshScrollAnims);
// =========================================================================
// INTERSECTION OBSERVERS (FADE IN EFFECTS)
// =========================================================================
const $ = document.querySelectorAll(".projects-content-group");
if ($.length > 0) {
  const e = new IntersectionObserver(
    (e) => {
      e.forEach((e) => {
        e.isIntersecting
          ? e.target.classList.add("visible")
          : e.target.classList.remove("visible");
      });
    },
    { threshold: 0.1 },
  );
  $.forEach((t) => e.observe(t));
}
const D = document.querySelectorAll(".fade-in-section");
if (D.length > 0) {
  const e = new IntersectionObserver(
    (t) => {
      t.forEach((t) => {
        t.isIntersecting &&
          (t.target.classList.add("visible"), e.unobserve(t.target));
      });
    },
    { threshold: 0.1 },
  );
  D.forEach((t) => e.observe(t));
}
const W = document.querySelectorAll(".blog-gallery-item");
if (W.length > 0) {
  const e = new IntersectionObserver(
    (t) => {
      t.forEach((t) => {
        t.isIntersecting &&
          (t.target.classList.add("visible"), e.unobserve(t.target));
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
  );
  W.forEach((t) => e.observe(t));
}
// =========================================================================
// PROJECTS MODAL LOGIC & DATA FETCHING
// =========================================================================
const V = document.getElementById("projectsStack"),
  _ = document.getElementById("projectModal"),
  U = document.getElementById("modalCloseBtn");
let Z = [];
function J() {
  _.classList.remove("active");
}
U && U.addEventListener("click", J);
const Q = document.querySelector(".modal-content-wrapper");
(Q &&
  Q.addEventListener("mouseleave", () => {
    setTimeout(() => {
      _.matches(":hover") && J();
    }, 300);
  }),
  _ &&
    _.addEventListener("click", (e) => {
      (e.target === _ || e.target.classList.contains("modal-backdrop")) && J();
    }),
  (async function () {
    try {
      const e = await fetch("./data/projects.json");
      if (!e.ok) throw new Error("Failed to load projects data");
      Z = await e.json();

      // We don't need to render cards anymore as they are SSG
      // But we do need to handle clicks on the existing cards
      if (V) {
        V.addEventListener("click", (e) => {
          const card = e.target.closest(".project-row");
          if (card) {
            // If the user clicked a link or button, don't open the modal
            if (e.target.closest("a, button")) return;

            const indexValue = card.getAttribute("data-index");
            // Find the project by ID since build.js uses proj.id for data-index
            const project = Z.find((p) => p.id == indexValue) || Z[indexValue];

            if (project) {
              const modalImage = document.getElementById("modalImage");
              const modalCategory = document.getElementById("modalCategory");
              const modalTitle = document.getElementById("modalTitle");
              const modalDescription =
                document.getElementById("modalDescription");
              const modalTechStack = document.getElementById("modalTechStack");
              const modalLink = document.getElementById("modalLink");

              if (modalTitle) modalTitle.textContent = project.title;
              if (modalDescription)
                modalDescription.textContent = project.description;
              if (modalCategory)
                modalCategory.textContent = project.category || "";
              if (modalImage) {
                const themeVal =
                  document.documentElement.getAttribute("data-theme") || "dark";
                modalImage.src =
                  themeVal === "light"
                    ? project.thumbnail.light
                    : project.thumbnail.dark;
              }

              if (modalTechStack) {
                modalTechStack.innerHTML = "";
                (project.technologies || []).forEach((tech) => {
                  const span = document.createElement("span");
                  span.className = "tech-pill";
                  span.textContent = tech;
                  modalTechStack.appendChild(span);
                });
              }

              if (modalLink) modalLink.href = project.link;

              _.classList.add("active");
            }
          }
        });
      }
    } catch (e) {
      console.error("Error loading projects:", e);
    }
  })(),
  document.addEventListener("pointermove", (e) => {
    const t = e.target.closest(".glow-container");
    if (t) {
      t.querySelectorAll(".glow-card").forEach((t) => {
        const o = t.getBoundingClientRect();
        (t.style.setProperty("--x", e.clientX - o.left + "px"),
          t.style.setProperty("--y", e.clientY - o.top + "px"));
      });
    }
  }));
// =========================================================================
// CONTACT MODAL & EMAILJS FORM SUBMISSION
// =========================================================================
const K = document.getElementById("contactModal"),
  ee = document.getElementById("openContactBtn"),
  te = document.getElementById("contactModalCloseBtn");
function oe() {
  K && K.classList.remove("active");
}
(ee &&
  ee.addEventListener("click", function () {
    K && K.classList.add("active");
  }),
  te && te.addEventListener("click", oe),
  K &&
    K.addEventListener("click", (e) => {
      (e.target === K || e.target.classList.contains("modal-backdrop")) && oe();
    }));

const ie = document.getElementById("contactForm"),
  ae = ie ? ie.querySelector(".contact-submit-btn") : null;
ie &&
  ae &&
  ie.addEventListener("submit", function (e) {
    e.preventDefault();

    // 1. Bot Protection (Honeypot)
    if (this.querySelector('[name="website"]').value) {
      console.warn("Spam detected.");
      return;
    }

    // 2. Client-side Rate Limiting (1 per minute)
    const lastSubmit = localStorage.getItem("contact_last_submit");
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
      alert("Please wait a moment before sending another message.");
      return;
    }

    // 3. Basic Validation
    const email = this.querySelector('[name="email"]').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    const t = ae.textContent;
    ((ae.textContent = "Sending..."), (ae.disabled = !0));
    
    emailjs
      .sendForm("service_fklvlrs", "template_zjkrkz8", this)
      .then(() => {
        localStorage.setItem("contact_last_submit", Date.now().toString());
        (alert("Message sent successfully! I will get back to you soon."),
          ie.reset(),
          (ae.textContent = t),
          (ae.disabled = !1));
        const e = document.getElementById("contactModalCloseBtn");
        e && e.click();
      })
      .catch((e) => {
        (console.error("EmailJS Error:", e),
          alert(
            "Failed to send message. Please try again later or email me directly.",
          ),
          (ae.textContent = t),
          (ae.disabled = !1));
      });
  });
// =========================================================================
// GALLERY SEARCH & FILTER LOGIC
// =========================================================================
const gallerySearch = document.getElementById("gallerySearch");
const clearSearchBtn = document.getElementById("clearSearch");

// Helper: Debounce function to limit execution frequency
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Function to perform search and filter
const performSearch = (searchTerm = "") => {
  const query = searchTerm.toLowerCase().trim();
  const keywords = query.split(/\s+/).filter(k => k.length > 0);
  const projects = document.querySelectorAll(".project-row");

  // Toggle clear button
  if (clearSearchBtn) {
    const isSearchEmpty = query.length === 0;
    clearSearchBtn.style.opacity = isSearchEmpty ? "0" : "1";
    clearSearchBtn.style.pointerEvents = isSearchEmpty ? "none" : "auto";
  }

  projects.forEach((project) => {
    const title = project.querySelector(".project-row-title")?.textContent.toLowerCase() || "";
    const desc = project.querySelector(".project-row-desc")?.textContent.toLowerCase() || "";
    const tech = Array.from(project.querySelectorAll(".project-row-pill"))
      .map((p) => p.textContent.toLowerCase())
      .join(" ");

    // Check if ALL keywords match at least one field (multi-keyword AND search)
    const matchesAllKeywords = keywords.every(kw => 
      title.includes(kw) || desc.includes(kw) || tech.includes(kw)
    );

    const matches = keywords.length === 0 || matchesAllKeywords;

    if (matches) {
      project.style.display = "block";
      project.classList.remove("filtered-out");
      // Optional: Add a subtle animation/transition
      project.animate([
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 300, easing: "ease-out", fill: "both" });
    } else {
      project.style.display = "none";
      project.classList.add("filtered-out");
    }
  });

  // Check if no results
  const visibleProjects = Array.from(projects).filter(p => p.style.display !== "none");
  const projectsStack = document.getElementById("projectsStack");
  let noResultsMsg = document.getElementById("noResultsMsg");

  if (visibleProjects.length === 0 && query.length > 0) {
    if (!noResultsMsg) {
      noResultsMsg = document.createElement("div");
      noResultsMsg.id = "noResultsMsg";
      noResultsMsg.className = "no-results-message fade-element visible";
      noResultsMsg.innerHTML = `
        <div class="no-results-content">
          <i class="fa-solid fa-magnifying-glass-chart" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <h3>No matches for "${searchTerm}"</h3>
          <p>Try different keywords or browse our full collection below.</p>
        </div>
      `;
      projectsStack?.appendChild(noResultsMsg);
    } else {
      noResultsMsg.querySelector("h3").textContent = `No matches for "${searchTerm}"`;
    }
  } else {
    noResultsMsg?.remove();
  }

  // Update URL search param without reloading
  if (window.location.pathname.endsWith("projects.html")) {
    const url = new URL(window.location);
    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url);
  }
};

// Main search listener with debouncing
if (gallerySearch) {
  const debouncedSearch = debounce((e) => {
    performSearch(e.target.value);
  }, 250);

  gallerySearch.addEventListener("input", debouncedSearch);

  // Initial check from URL parameters
  window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");
    if (initialQuery) {
      gallerySearch.value = initialQuery;
      performSearch(initialQuery);
    }
  });
}

if (clearSearchBtn && gallerySearch) {
  clearSearchBtn.addEventListener("click", () => {
    gallerySearch.value = "";
    performSearch(""); // Execute immediately without debounce
    gallerySearch.focus();
  });
}

// =========================================================================
// BLOG GRID PAGINATION & RENDERING
// =========================================================================
// =========================================================================
// BLOG / ARTICLES RENDERING (EDITORIAL BENTO ARCHITECTURE)
// =========================================================================
const blogGalleryContainer = document.getElementById("blogGalleryContainer");
const blogPaginationControls = document.getElementById(
  "blogPaginationControls",
);

let blogData = [];

function renderBlogPage() {
  if (!blogGalleryContainer) return;

  if (!blogData || blogData.length === 0) {
    blogGalleryContainer.innerHTML =
      '<p style="text-align:center; padding: 3rem; color: var(--text-muted); font-family: monospace;">No dispatches available.</p>';
    return;
  }

  const primaryPost = blogData[0];
  const theme = document.documentElement.getAttribute("data-theme") || "dark";
  const lightAvatar = "images/light mode(gamified).png";
  const darkAvatar = "images/dark mode(gamified).png";
  const currentAvatar = theme === "light" ? lightAvatar : darkAvatar;

  let listHtml = "";
  blogData.forEach((post, index) => {
    const num = String(index + 1).padStart(2, '0');
    listHtml += `
      <a href="${post.link}" class="cinematic-blog-row">
        <div class="blog-row-meta">
          <span class="blog-row-num">${num}</span>
          <span class="blog-row-cat">${post.category || "Development"}</span>
        </div>
        <div class="blog-row-content">
          <h3 class="blog-row-title">${post.topic}</h3>
          <p class="blog-row-excerpt">${post.description}</p>
        </div>
        <div class="blog-row-action">
          <span class="blog-row-date">${post.date || "2026"}</span>
          <div class="blog-arrow-icon"><i data-lucide="arrow-right"></i></div>
        </div>
      </a>
    `;
  });

  const html = `
    <div class="cinematic-blog-layout">
      <!-- Sticky Sidebar: Gamified Poster -->
      <div class="blog-sidebar">
        <div class="gamified-poster-card glow-card sticky-poster">
          <div class="gamified-poster-image">
            <img src="${currentAvatar}" 
                 data-light="${lightAvatar}" 
                 data-dark="${darkAvatar}" 
                 alt="Mosa Moleleki Pixel Avatar" 
                 class="gamified-avatar-img" 
                 id="gamifiedAvatarImg" />
            <div class="gamified-poster-overlay">
              <div class="author-status-badge">
                <span class="status-pulse-dot"></span>
                <span>Writing & Research</span>
              </div>
              <div class="gamified-poster-text">
                <span class="poster-title">SUDO</span>
                <span class="poster-subtitle">DISPATCHES</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable List of Articles -->
      <div class="blog-list-container">
        <div class="blog-list">
          ${listHtml}
        </div>
      </div>
    </div>
  `;

  blogGalleryContainer.innerHTML = html;

  // Initialize Lucide icons on newly injected elements
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  // Attach pointermove for glow-card effect
  blogGalleryContainer.querySelectorAll(".glow-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const o = card.getBoundingClientRect();
      card.style.setProperty("--x", e.clientX - o.left + "px");
      card.style.setProperty("--y", e.clientY - o.top + "px");
    });
  });
}

function updateBlogPaginationControls() {
  if (!blogPaginationControls) return;
  blogPaginationControls.style.display = "none";
}

// Fetch loop
if (blogGalleryContainer) {
  fetch("./data/blog.json")
    .then((res) => res.json())
    .then((data) => {
      blogData = data;
      renderBlogPage();
    })
    .catch((err) => console.error("Error loading blog data:", err));
}

// ==========================================
// ABOUT SECTION (REDESIGN) REVEAL ANIMATIONS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const revealItems = document.querySelectorAll('.text-reveal-item');
    if (revealItems.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, index * 150); // Stagger the animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealItems.forEach(item => {
            revealObserver.observe(item);
        });
    }
});


// =========================================================================
// INTERSECTION OBSERVER FOR FADE-UP ANIMATIONS (MODERN JS PATTERNS)
// =========================================================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Optional: Stop observing once visible if you want it to trigger only once
        // observer.unobserve(entry.target); 
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  document.querySelectorAll('.fade-up-element').forEach(el => {
    observer.observe(el);
  });
}

document.addEventListener("DOMContentLoaded", initScrollAnimations);
// Also run it once immediately in case DOM is already loaded
if(document.readyState !== "loading") initScrollAnimations();
