'use strict';

(function () {
  /** @type {object} */
  var i18n = {};

  var ICON_SVG = '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>';

  var BUTTON_MARKER = 'fbfb-filter-btn';

  /** @param {HTMLElement} flux */
  function injectButton(flux) {
    var toolbar = flux.querySelector('.flux_header .item.bar');
    if (!toolbar) return;
    if (toolbar.querySelector('.' + BUTTON_MARKER)) return;

    var btn = document.createElement('a');
    btn.className = BUTTON_MARKER;
    btn.href = '#';
    btn.title = i18n.buttonTooltip || 'Add block filter';
    btn.setAttribute('aria-label', btn.title);
    btn.innerHTML = ICON_SVG;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      onFilterButtonClick(flux);
    });

    toolbar.appendChild(btn);
  }

  function injectAllButtons() {
    var articles = document.querySelectorAll('.flux');
    var i;
    for (i = 0; i < articles.length; i++) {
      injectButton(articles[i]);
    }
  }

  function observeNewArticles() {
    var streamEl = document.getElementById('stream');
    if (!streamEl) return;

    var observer = new MutationObserver(function (mutations) {
      var m, j, k, added, node, nested;
      for (m = 0; m < mutations.length; m++) {
        added = mutations[m].addedNodes;
        for (j = 0; j < added.length; j++) {
          node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains('flux')) {
            injectButton(node);
          }
          if (node.querySelectorAll) {
            nested = node.querySelectorAll('.flux');
            for (k = 0; k < nested.length; k++) {
              injectButton(nested[k]);
            }
          }
        }
      }
    });

    observer.observe(streamEl, { childList: true, subtree: true });
  }

  /** @param {HTMLElement} flux */
  function onFilterButtonClick(flux) {
    var feedId = extractFeedId(flux);
    if (!feedId) {
      showNotification(i18n.errorNoFeedId || 'Cannot determine feed ID for this article.', 'bad');
      return;
    }
    if (typeof window.FeedBlockFilterBuilder !== 'undefined' &&
        typeof window.FeedBlockFilterBuilder.openModal === 'function') {
      window.FeedBlockFilterBuilder.openModal(flux, feedId);
    } else {
      showNotification(i18n.errorNotReady || 'Filter builder is not ready.', 'bad');
    }
  }

  /**
   * @param {HTMLElement} flux
   * @returns {string|null}
   */
  function extractFeedId(flux) {
    var header = flux.querySelector('.flux_header');
    var links, i, match;
    if (!header) return null;

    links = header.querySelectorAll('a[href]');
    for (i = 0; i < links.length; i++) {
      match = links[i].href.match(/f_(\d+)/);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * @param {string} message
   * @param {string} type - 'good' or 'bad'
   */
  function showNotification(message, type) {
    var container;
    if (typeof openNotification === 'function') {
      openNotification(message, type);
      return;
    }
    container = document.getElementById('notification');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification';
      document.body.appendChild(container);
    }
    container.className = 'notification ' + type;
    container.textContent = message;
    container.style.display = 'block';
    setTimeout(function () {
      container.style.display = 'none';
    }, 4000);
  }

  function init() {
    if (window.context &&
        window.context.extensions &&
        window.context.extensions.feedBlockFilterBuilder &&
        window.context.extensions.feedBlockFilterBuilder.i18n) {
      i18n = window.context.extensions.feedBlockFilterBuilder.i18n;
    }

    injectAllButtons();
    observeNewArticles();
  }

  window.FeedBlockFilterBuilder = window.FeedBlockFilterBuilder || {};
  window.FeedBlockFilterBuilder.showNotification = showNotification;
  window.FeedBlockFilterBuilder.extractFeedId = extractFeedId;
  window.FeedBlockFilterBuilder.i18n = function () { return i18n; };

  document.addEventListener('freshrss:globalContextLoaded', init);
})();
