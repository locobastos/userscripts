// ==UserScript==
// @name         myDofus - Territories Sorter
// @namespace    https://mydofus.de/
// @version      1.0
// @description  Sorts territories alphabetically within each area on the /territories page
// @author       Achimatte
// @match        https://mydofus.de/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const LOCALE = document.documentElement.lang || 'fr';

    function getTerritoryName(li) {
        const span = li.querySelector('span');
        if (!span) return '';
        return span.textContent.replace(/\s*\(.*\)\s*$/, '').trim();
    }

    function sortTerritoriesInDOM() {
        const lists = document.querySelectorAll('#app div > ul');
        let sorted = false;

        for (const ul of lists) {
            const items = [...ul.querySelectorAll(':scope > li')];
            if (items.length < 2) continue;

            items.sort((a, b) => getTerritoryName(a).localeCompare(getTerritoryName(b), LOCALE));

            for (const li of items) {
                ul.appendChild(li);
            }
            sorted = true;
        }

        if (sorted) {
            console.log('[myDofus Sort] Territories sorted alphabetically.');
        }
        return sorted;
    }

    function watchAndSort() {
        if (!location.pathname.startsWith('/territories')) return;

        const app = document.getElementById('app');
        if (!app) return;

        let debounceTimer = null;

        const observer = new MutationObserver(() => {
            // Debounce: wait for DOM mutations to settle before sorting
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (sortTerritoriesInDOM()) {
                    observer.disconnect();
                }
            }, 300);
        });

        observer.observe(app, { childList: true, subtree: true });

        // Safety timeout: stop observing after 10s even if nothing happened
        setTimeout(() => observer.disconnect(), 10000);
    }

    // Handle initial page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', watchAndSort);
    } else {
        watchAndSort();
    }

    // Handle SPA navigations
    document.addEventListener('inertia:navigate', () => {
        setTimeout(watchAndSort, 200);
    });
})();
