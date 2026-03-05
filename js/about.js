/**
 * About Page Module
 * Handles interactions specific to the about page including hero image theme syncing,
 * scroll animations for timeline entries, skills, and the Back to Top button.
 */

// Protective Console Messages
console.log(
  "%c⚠ STOP!",
  "color: #ff4444; font-size: 2rem; font-weight: 900; text-shadow: 0 0 8px #ff4444;"
);
console.log(
  "%cThis is a proprietary, privately-owned portfolio.\n\nAll source code, design, and assets are copyright © 2024–2026 Mosa Moleleki.\nUnauthorised copying, cloning, or reproduction is strictly prohibited.\n\nTo request permission: Molelekishoez@gmail.com\nLicense: https://github.com/Mr-Shoez/personalPortfolioProject/blob/main/LICENSE",
  "color: #ffffff; font-size: 0.9rem; line-height: 1.8; background: #111; padding: 12px 16px; border-left: 4px solid #ff4444; border-radius: 4px;"
);

document.addEventListener("DOMContentLoaded", function () {
  /**
   * Hero Image Theme Syncing
   * If the global ThemeSystem is available, sync the hero image photo
   * depending on the active theme (light/dark mode variants).
   */
  if (window.ThemeSystem) {
    function updateHeroImage(theme) {
      const heroPhoto = document.querySelector(".about-hero-photo");
      if (heroPhoto) {
        heroPhoto.src = theme === "light" 
          ? "my pictures/light mode.webp" 
          : "my pictures/dark mode.webp";
      }
    }
    
    // Ensure ThemeSystem is initialized and set initial state
    window.ThemeSystem.init();
    updateHeroImage(window.ThemeSystem.get());
    
    // Listen for future theme changes
    document.addEventListener("themechange", function (event) {
      updateHeroImage(event.detail.theme);
    });
  }

  /**
   * Generic Fade-In Animations
   * Applies a 'visible' class to elements with the '.ap-fade' class when
   * they scroll into view.
   */
  const fadeElements = document.querySelectorAll(".ap-fade");
  if (fadeElements.length > 0) {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    fadeElements.forEach((el) => fadeObserver.observe(el));
  }

  /**
   * Back to Top Button Interaction
   * Moved to global theme.js
   */

  /**
   * Education Timeline Scroll Animations
   * Fills in the dot of an education timeline entry sequentially
   * when it scrolls into the viewport.
   */
  const eduEntries = document.querySelectorAll(".about-edu-entry");
  if (eduEntries.length > 0) {
    const eduObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              const dot = entry.target.querySelector(".about-edu-dot");
              if (dot) dot.classList.add("filled");
            }, 150 * index);
            eduObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    eduEntries.forEach((el) => eduObserver.observe(el));
  }

  /**
   * Skills Grid Scroll Animations
   * Calculates specific transition delays for each skill card
   * to create a staggered entrance effect when they become visible.
   */
  const skillCards = document.querySelectorAll(".skill-card");
  if (skillCards.length > 0) {
    const skillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = entry.target.dataset.delay || "0s";
            entry.target.classList.add("visible");
            skillObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    
    // Assign specific delays based on element index
    skillCards.forEach((el, index) => {
      el.dataset.delay = (0.06 * index) + "s";
      el.classList.add("ap-fade"); // Re-use the ap-fade fade-in style
      skillObserver.observe(el);
    });
  }
});
