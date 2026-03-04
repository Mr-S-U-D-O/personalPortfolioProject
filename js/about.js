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
// Theme System (mirrors index.js)
// =========================================
const themeToggleBtn = document.getElementById('themeToggle');
const themeToggleIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);

    if (themeToggleIcon) {
        themeToggleIcon.className = themeName === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    // Sync profile photo
    const heroPhoto = document.querySelector('.about-hero-photo');
    if (heroPhoto) {
        heroPhoto.src = themeName === 'light' ? 'my pictures/light mode.webp' : 'my pictures/dark mode.webp';
    }

    // Sync favicon ids (same logic as index)
    const LIGHT = 'asserts/light mode favicon/';
    const DARK  = 'asserts/dark mode favicon/';
    const faviconMap = [
        { id: 'favicon-32',    file: 'favicon-32x32.png' },
        { id: 'favicon-16',    file: 'favicon-16x16.png' },
        { id: 'favicon-ico',   file: 'favicon.ico' },
        { id: 'favicon-apple', file: 'apple-touch-icon.png' },
    ];
    const base = themeName === 'dark' ? DARK : LIGHT;
    faviconMap.forEach(f => {
        const el = document.getElementById(f.id);
        if (el) el.href = base + f.file;
    });
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'light' ? 'dark' : 'light');
}

const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
setTheme(savedTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

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
