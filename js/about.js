/**
 * ============================================================
 *  Portfolio Script — about.js
 *  Copyright (c) 2024–2026 Mosa Moleleki ("Mr-S-U-D-O" / "S.U.D.O")
 *  All Rights Reserved. Proprietary & Confidential.
 *  See LICENSE in the project root for full terms.
 *  Contact: Molelekishoez@gmail.com
 * ============================================================
 */

// ─── DevTools Copyright Notice ──────────────────────────────────────────────
console.log(
  '%c⚠ STOP!',
  'color: #ff4444; font-size: 2rem; font-weight: 900; text-shadow: 0 0 8px #ff4444;'
);
console.log(
  '%cThis is a proprietary, privately-owned portfolio.\n\nAll source code, design, and assets are copyright © 2024–2026 Mosa Moleleki.\nUnauthorised copying, cloning, or reproduction is strictly prohibited.\n\nTo request permission: Molelekishoez@gmail.com\nLicense: https://github.com/Mr-S-U-D-O/personalPortfolioProject/blob/main/LICENSE',
  'color: #ffffff; font-size: 0.9rem; line-height: 1.8; background: #111; padding: 12px 16px; border-left: 4px solid #ff4444; border-radius: 4px;'
);
// ────────────────────────────────────────────────────────────────────────────

// =========================================
// Theme System — wired via universal ThemeSystem (js/theme.js loaded in <head>)
// =========================================
document.addEventListener('DOMContentLoaded', function () {
    if (window.ThemeSystem) {
        window.ThemeSystem.init();

        // Also sync profile photo to theme on load and on change
        function syncPhoto(theme) {
            const heroPhoto = document.querySelector('.about-hero-photo');
            if (heroPhoto) {
                heroPhoto.src = theme === 'light' ? 'my pictures/light mode.webp' : 'my pictures/dark mode.webp';
            }
        }
        syncPhoto(window.ThemeSystem.get());
        document.addEventListener('themechange', function (e) {
            syncPhoto(e.detail.theme);
        });
    }
});


// =========================================
// Scroll Animations — Fade Up
// =========================================
const fadeEls = document.querySelectorAll('.ap-fade');
if (fadeEls.length > 0) {
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeEls.forEach(el => fadeObserver.observe(el));
}

// =========================================
// Back To Top Button
// =========================================
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =========================================
// Contact Modal (reuse from index.html)
// =========================================
// "Let's Talk" button scrolls to index contact — direct link is simpler here
// handled via href in HTML

// =========================================
// Animate edu dots when card scrolls in
// =========================================
const eduEntries = document.querySelectorAll('.about-edu-entry');
if (eduEntries.length > 0) {
    const eduObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    const dot = entry.target.querySelector('.about-edu-dot');
                    if (dot) dot.classList.add('filled');
                }, i * 150);
                eduObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    eduEntries.forEach(el => eduObserver.observe(el));
}

// =========================================
// Stagger skill cards
// =========================================
const skillCards = document.querySelectorAll('.skill-card');
if (skillCards.length > 0) {
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transitionDelay = entry.target.dataset.delay || '0s';
                entry.target.classList.add('visible');
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    skillCards.forEach((card, i) => {
        card.dataset.delay = `${i * 0.06}s`;
        card.classList.add('ap-fade'); // reuse animation
        cardObserver.observe(card);
    });
}
