/**
 * Theme Management System
 * Handles light/dark mode toggling, applying the theme to the DOM,
 * syncing with localStorage, and updating Favicons.
 */
(function () {
  const THEME_STORAGE_KEY = "theme";

  /**
   * Retrieves the current theme from localStorage or system preference.
   * @returns {string} 'light' or 'dark'
   */
  function getTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
    // Fallback to reading the OS preference
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  // Apply theme immediately on script load to prevent flashing
  document.documentElement.setAttribute("data-theme", getTheme());

  let isListenerAttached = false;

  /**
   * Updates the site favicons based on the active theme.
   * Ensures the paths resolve correctly on sub-pages (e.g. 404).
   *
   * @param {string} theme - The active theme ('light' or 'dark')
   */
  function updateFavicon(theme) {
    const depth = (window.location.pathname.match(/\//g) || []).length - 1;
    const basePath =
      (depth > 1 ? "../" : "") +
      "assets/" +
      (theme === "dark" ? "dark mode favicon" : "light mode favicon") +
      "/";

    const icons = [
      { id: "favicon-32", file: "favicon-32x32.png" },
      { id: "favicon-16", file: "favicon-16x16.png" },
      { id: "favicon-ico", file: "favicon.ico" },
      { id: "favicon-apple", file: "apple-touch-icon.png" },
    ];

    icons.forEach(({ id, file }) => {
      const linkEl = document.getElementById(id);
      if (linkEl) {
        linkEl.href = basePath + file;
      }
    });
  }

  /**
   * Swaps images on the page that have data-light and data-dark atttributes.
   * Useful for preview images that should change with the theme.
   *
   * @param {string} theme - The active theme ('light' or 'dark')
   */
  function updateThemeAwareImages(theme) {
    const images = document.querySelectorAll("img[data-light][data-dark]");
    images.forEach((img) => {
      const newSrc =
        theme === "light"
          ? img.getAttribute("data-light")
          : img.getAttribute("data-dark");
      if (newSrc && img.src !== newSrc) {
        img.src = newSrc;
      }
    });
  }

  // Expose ThemeSystem to global window object
  window.ThemeSystem = {
    KEY: THEME_STORAGE_KEY,
    get: getTheme,

    /**
     * Sets a specific theme, saves to localStorage, updates DOM,
     * toggles favicons, and dispatches 'themechange' event.
     * @param {string} themeName - 'light' or 'dark'
     */
    set: function (themeName) {
      document.documentElement.setAttribute("data-theme", themeName);
      localStorage.setItem(THEME_STORAGE_KEY, themeName);

      // Update UI for all toggle buttons
      document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
        const icon = btn.querySelector("i");
        if (icon) {
          icon.className =
            themeName === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
      });

      updateFavicon(themeName);
      updateThemeAwareImages(themeName);
      document.dispatchEvent(
        new CustomEvent("themechange", { detail: { theme: themeName } }),
      );
    },

    /**
     * Toggles the current theme between light and dark.
     */
    toggle: function () {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "dark";
      window.ThemeSystem.set(currentTheme === "dark" ? "light" : "dark");
    },

    /**
     * Initializes the theme system on page load: attaches click events
     * to toggle buttons and sets the correct initial favicons.
     */
    init: function () {
      // 1. Ensure Persistent UI (Theme, Mute, CV) exists before wiring events
      this.initPersistentUI();

      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "dark";

      // 2. Attach interaction handlers to toggle buttons
      document
        .querySelectorAll("[data-theme-toggle], .theme-toggle")
        .forEach((btn) => {
          btn.setAttribute("data-theme-toggle", "");
          const icon = btn.querySelector("i");
          if (icon) {
            icon.className =
              currentTheme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
          }

          // Prevent attaching multiple event listeners to the same button
          if (!btn.dataset.themeWired) {
            btn.dataset.themeWired = "true";
            btn.addEventListener("click", () => {
              window.ThemeSystem.toggle();
            });
          }
        });

      updateFavicon(currentTheme);
      updateThemeAwareImages(currentTheme);

      // 3. Initialize other systems
      this.initBackToTop();
      this.initSearch();
      this.initObservers();
      this.initSound();
    },

    /**
     * Ensures consistent UI elements (Theme Toggle, Mute Toggle, CV Link)
     * exist on every page.
     */
    initPersistentUI: function () {
      // 1. Handle Utility Toggles (Theme & Mute)
      let toggles = document.querySelector(".utility-toggles");
      if (!toggles) {
        toggles = document.createElement("div");
        toggles.className = "utility-toggles";
        document.body.appendChild(toggles);
      }

      // Ensure Mute Toggle
      if (!document.getElementById("muteToggle")) {
        const muteBtn = document.createElement("button");
        muteBtn.id = "muteToggle";
        muteBtn.className = "mute-toggle";
        muteBtn.setAttribute("aria-label", "Toggle Audio");
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        toggles.prepend(muteBtn);
      }

      // Ensure Theme Toggle
      if (!document.querySelector(".theme-toggle, [data-theme-toggle]")) {
        const themeBtn = document.createElement("button");
        themeBtn.className = "theme-toggle";
        themeBtn.setAttribute("data-theme-toggle", "");
        themeBtn.setAttribute("aria-label", "Toggle Dark Mode");
        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        toggles.appendChild(themeBtn);
      }

      // 2. Handle CV Navigation
      if (!document.querySelector(".cv-nav")) {
        // Calculate paths based on location
        const isProjectSub = window.location.pathname.includes("/projects/");
        const isPostSub = window.location.pathname.includes("/posts/");
        const basePath = isProjectSub || isPostSub ? "../" : "./";

        const cvNav = document.createElement("nav");
        cvNav.className = "sidebar-nav cv-nav";
        cvNav.innerHTML = `
          <ul class="nav-menu">
            <li class="nav-item">
              <a href="${basePath}cv/mosa_moleleki_cv.pdf" download="Mosa_Moleleki_CV.pdf" target="_blank" class="nav-link cv-link" id="resumeLink">
                <span class="nav-text">Resume</span>
                <i class="fa-solid fa-download nav-icon"></i>
              </a>
            </li>
          </ul>
        `;
        document.body.appendChild(cvNav);
      }
    },

    /**
     * Initializes IntersectionObservers for common animations like fade-in-section.
     */
    initObservers: function () {
      const fadeSections = document.querySelectorAll(".fade-in-section");
      if (fadeSections.length > 0) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.1 },
        );
        fadeSections.forEach((section) => observer.observe(section));
      }
    },

    /**
     * Initializes the sound system, sharing state with sessionStorage.
     */
    initSound: function () {
      const muteBtn = document.getElementById("muteToggle");
      if (!muteBtn) return;

      const isMuted = sessionStorage.getItem("isMuted") === "true";

      const updateMuteUI = (muted) => {
        const icon = muteBtn.querySelector("i");
        if (icon) {
          icon.className = muted
            ? "fa-solid fa-volume-xmark"
            : "fa-solid fa-volume-high";
        }
      };

      // Initial UI state
      updateMuteUI(isMuted);

      if (!muteBtn.dataset.soundWired) {
        muteBtn.dataset.soundWired = "true";
        muteBtn.addEventListener("click", () => {
          const currentlyMuted = sessionStorage.getItem("isMuted") === "true";
          const newState = !currentlyMuted;
          sessionStorage.setItem("isMuted", newState);
          updateMuteUI(newState);

          // Dispatch event for other scripts (like index.js) to sync
          document.dispatchEvent(
            new CustomEvent("soundtoggle", { detail: { isMuted: newState } }),
          );
        });
      }
    },

    /**
     * Initializes the search functionality for the project gallery.
     */
    initSearch: function () {
      const searchInput = document.getElementById("gallerySearch");
      const clearBtn = document.getElementById("clearSearch");
      if (!searchInput) return;

      const updateClearBtn = () => {
        if (clearBtn) {
          if (searchInput.value.length > 0) {
            clearBtn.classList.add("active");
          } else {
            clearBtn.classList.remove("active");
          }
        }
      };

      searchInput.addEventListener("input", updateClearBtn);

      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          searchInput.value = "";
          updateClearBtn();
          searchInput.focus();
          // Trigger input event to let other listeners (like filter logic) know
          searchInput.dispatchEvent(new Event("input"));
        });
      }

      // Initial check
      updateClearBtn();
    },

    /**
     * Initializes the Back to Top button functionality.
     * Shows the button when scrolling down or nearing the bottom.
     */
    initBackToTop: function () {
      const backToTopBtn = document.getElementById("backToTop");
      if (!backToTopBtn) return;

      const handleScroll = () => {
        const scrollY =
          window.scrollY ||
          document.body.scrollTop ||
          document.documentElement.scrollTop ||
          0;
        const windowHeight = window.innerHeight;
        const fullHeight = Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight,
        );

        // Show if scrolled down more than 400px OR within 300px of the bottom
        const isNearBottom = scrollY + windowHeight > fullHeight - 300;
        const isScrolledDown = scrollY > 400;

        if (isScrolledDown || isNearBottom) {
          backToTopBtn.classList.add("visible");
        } else {
          backToTopBtn.classList.remove("visible");
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("scroll", handleScroll, { passive: true });

      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (document.body.scrollTo) {
          document.body.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          document.body.scrollTop = 0;
        }
      });

      // Run once initially
      handleScroll();
    },

    /**
     * Fetches the current star count for the project repository from GitHub API
     * and updates the displayed count in the footer.
     */
    fetchGitHubStars: async function () {
      const starCountElement = document.getElementById("github-star-count");
      if (!starCountElement) return;

      try {
        const response = await fetch(
          "https://api.github.com/repos/mr-s-u-d-o/personalPortfolioProject",
        );
        if (!response.ok) throw new Error("GitHub API response not ok");
        const data = await response.json();

        if (data && typeof data.stargazers_count === "number") {
          starCountElement.textContent = data.stargazers_count;
        }
      } catch (error) {
        console.error("Error fetching GitHub stars:", error);
      }
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.ThemeSystem.init();
    window.ThemeSystem.fetchGitHubStars();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
  });
})();
