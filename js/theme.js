/**
 * theme.js — Universal Theme System
 * ============================================================
 * Must be loaded as a regular (non-deferred) <script> in <head>
 * so that [data-theme] is applied before first paint (no flash).
 *
 * localStorage key: 'theme'  ('light' | 'dark')
 * ============================================================
 */
(function () {
    const STORAGE_KEY = 'theme';

    // Read saved preference, fall back to OS preference
    function resolveTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    // Apply on documentElement so [data-theme="light"] CSS vars fire instantly
    document.documentElement.setAttribute('data-theme', resolveTheme());

    // Expose a global helper for every page's toggle button
    window.ThemeSystem = {
        KEY: STORAGE_KEY,

        get: resolveTheme,

        set: function (themeName) {
            document.documentElement.setAttribute('data-theme', themeName);
            localStorage.setItem(STORAGE_KEY, themeName);
            // Update any theme-toggle button icons on the page
            document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
                var icon = btn.querySelector('i');
                if (icon) {
                    icon.className = themeName === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
                }
            });
            // Fire a custom event so any page can react
            document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeName } }));
        },

        toggle: function () {
            var current = document.documentElement.getAttribute('data-theme') || 'dark';
            window.ThemeSystem.set(current === 'dark' ? 'light' : 'dark');
        },

        // Call once per page to wire up any .theme-toggle button
        init: function () {
            // Update icon immediately
            var theme = document.documentElement.getAttribute('data-theme') || 'dark';
            document.querySelectorAll('[data-theme-toggle], .theme-toggle').forEach(function (btn) {
                btn.setAttribute('data-theme-toggle', '');
                var icon = btn.querySelector('i');
                if (icon) {
                    icon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
                }
                btn.addEventListener('click', function () {
                    window.ThemeSystem.toggle();
                });
            });

            // Favicon sync
            var LIGHT_FAV = 'asserts/light mode favicon/';
            var DARK_FAV  = 'asserts/dark mode favicon/';
            var faviconMap = [
                { id: 'favicon-32',    file: 'favicon-32x32.png' },
                { id: 'favicon-16',    file: 'favicon-16x16.png' },
                { id: 'favicon-ico',   file: 'favicon.ico' },
                { id: 'favicon-apple', file: 'apple-touch-icon.png' },
            ];
            function syncFavicons(t) {
                var base = t === 'dark' ? DARK_FAV : LIGHT_FAV;
                faviconMap.forEach(function (f) {
                    var el = document.getElementById(f.id);
                    if (el) el.href = base + f.file;
                });
            }
            syncFavicons(theme);
            document.addEventListener('themechange', function (e) {
                syncFavicons(e.detail.theme);
            });
        }
    };
})();
