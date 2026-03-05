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
    const basePath = (depth > 1 ? "../" : "") + "asserts/" + (theme === "dark" ? "dark mode favicon" : "light mode favicon") + "/";

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
          icon.className = themeName === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
      });

      updateFavicon(themeName);
      document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: themeName } }));
    },

    /**
     * Toggles the current theme between light and dark.
     */
    toggle: function () {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      window.ThemeSystem.set(currentTheme === "dark" ? "light" : "dark");
    },

    /**
     * Initializes the theme system on page load: attaches click events
     * to toggle buttons and sets the correct initial favicons.
     */
    init: function () {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";

      // Attach interaction handlers to toggle buttons
      document.querySelectorAll("[data-theme-toggle], .theme-toggle").forEach((btn) => {
        btn.setAttribute("data-theme-toggle", "");
        const icon = btn.querySelector("i");
        if (icon) {
          icon.className = currentTheme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
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

      // Listen for custom themechange events (fired by the system)
      if (!isListenerAttached) {
        isListenerAttached = true;
        document.addEventListener("themechange", (e) => {
          updateFavicon(e.detail.theme);
        });
      }

      // Initialize Back to Top Logic
      this.initBackToTop();
    },

    /**
     * Initializes the Back to Top button functionality.
     * Shows the button when scrolling down or nearing the bottom.
     */
    initBackToTop: function () {
      const backToTopBtn = document.getElementById("backToTop");
      if (!backToTopBtn) return;

      const handleScroll = () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;
        
        // Show if scrolled down more than 400px OR within 300px of the bottom
        const isNearBottom = (scrollY + windowHeight) > (fullHeight - 300);
        const isScrolledDown = scrollY > 400;

        if (isScrolledDown || isNearBottom) {
          backToTopBtn.classList.add("visible");
        } else {
          backToTopBtn.classList.remove("visible");
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      
      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });

      // Run once initially
      handleScroll();
    },
  };

  // Auto-initialize when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", function () {
    window.ThemeSystem.init();
  });
})();
