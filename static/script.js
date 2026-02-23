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
    btn.title = i18n.buttonTooltip;
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
      showNotification(i18n.errorNoFeedId, 'bad');
      return;
    }
    if (typeof window.FeedBlockFilterBuilder !== 'undefined' &&
        typeof window.FeedBlockFilterBuilder.openModal === 'function') {
      window.FeedBlockFilterBuilder.openModal(flux, feedId);
    } else {
      showNotification(i18n.errorNotReady, 'bad');
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

    createModal();
    injectAllButtons();
    observeNewArticles();
  }

  var modal = null;
  var modalOverlay = null;
  var modalDimensionSelect = null;
  var modalExpressionInput = null;
  var modalPreview = null;
  var modalSubmitBtn = null;
  var modalCurrentFlux = null;
  var modalCurrentFeedId = null;
  var isSubmitting = false;

  function createModal() {
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'fbfb-overlay';
    modalOverlay.addEventListener('click', closeModal);

    modal = document.createElement('div');
    modal.className = 'fbfb-modal';

    var title = document.createElement('h3');
    title.className = 'fbfb-modal-title';
    title.textContent = i18n.modalTitle;

    var dimensionLabel = document.createElement('label');
    dimensionLabel.className = 'fbfb-label';
    dimensionLabel.textContent = i18n.dimensionLabel;

    modalDimensionSelect = document.createElement('select');
    modalDimensionSelect.className = 'fbfb-select';
    modalDimensionSelect.addEventListener('change', onDimensionChange);

    var expressionLabel = document.createElement('label');
    expressionLabel.className = 'fbfb-label';
    expressionLabel.textContent = i18n.expressionLabel;

    modalExpressionInput = document.createElement('input');
    modalExpressionInput.type = 'text';
    modalExpressionInput.className = 'fbfb-input';
    modalExpressionInput.placeholder = i18n.expressionPlaceholder;
    modalExpressionInput.addEventListener('input', updatePreview);

    var previewLabel = document.createElement('label');
    previewLabel.className = 'fbfb-label';
    previewLabel.textContent = i18n.previewLabel;

    modalPreview = document.createElement('div');
    modalPreview.className = 'fbfb-preview';

    var btnGroup = document.createElement('div');
    btnGroup.className = 'fbfb-btn-group';

    modalSubmitBtn = document.createElement('button');
    modalSubmitBtn.className = 'fbfb-btn fbfb-btn-submit';
    modalSubmitBtn.textContent = i18n.submitBtn;
    modalSubmitBtn.disabled = true;
    modalSubmitBtn.addEventListener('click', onSubmitClick);

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'fbfb-btn fbfb-btn-cancel';
    cancelBtn.textContent = i18n.cancelBtn;
    cancelBtn.addEventListener('click', closeModal);

    btnGroup.appendChild(modalSubmitBtn);
    btnGroup.appendChild(cancelBtn);

    modal.appendChild(title);
    modal.appendChild(dimensionLabel);
    modal.appendChild(modalDimensionSelect);
    modal.appendChild(expressionLabel);
    modal.appendChild(modalExpressionInput);
    modal.appendChild(previewLabel);
    modal.appendChild(modalPreview);
    modal.appendChild(btnGroup);

    document.body.appendChild(modalOverlay);
    document.body.appendChild(modal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.style.display === 'block') {
        closeModal();
      }
    });
  }

  /**
   * @param {HTMLElement} flux
   * @param {string} feedId
   */
  function openModal(flux, feedId) {
    modalCurrentFlux = flux;
    modalCurrentFeedId = feedId;
    isSubmitting = false;

    var metadata = extractMetadata(flux);
    populateDimensions(metadata);

    modalExpressionInput.value = '';
    modalSubmitBtn.disabled = true;
    modalSubmitBtn.textContent = i18n.submitBtn;
    modalPreview.textContent = i18n.previewPlaceholder;
    modalPreview.classList.add('fbfb-preview-placeholder');

    modalOverlay.style.display = 'block';
    modal.style.display = 'block';

    if (modalDimensionSelect.options.length > 0) {
      onDimensionChange();
    }

    modalExpressionInput.focus();
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.style.display = 'none';
    if (modal) modal.style.display = 'none';
    modalCurrentFlux = null;
    modalCurrentFeedId = null;
    isSubmitting = false;
    if (modalExpressionInput) modalExpressionInput.value = '';
    if (modalDimensionSelect) modalDimensionSelect.innerHTML = '';
    if (modalPreview) {
      modalPreview.textContent = '';
      modalPreview.classList.remove('fbfb-preview-placeholder');
    }
    if (modalSubmitBtn) {
      modalSubmitBtn.disabled = true;
      modalSubmitBtn.textContent = i18n.submitBtn;
    }
  }

  /**
   * @param {HTMLElement} flux
   * @returns {{ title: string, author: string, feedName: string }}
   */
  function extractMetadata(flux) {
    var header = flux.querySelector('.flux_header');
    var titleEl, result;

    result = { title: '', author: '', feedName: '' };
    if (!header) return result;

    titleEl = flux.querySelector('.item-element.title');
    if (titleEl) {
      result.title = titleEl.textContent.trim();
    }

    result.author = (header.dataset.articleAuthors || '').trim();
    result.feedName = (header.dataset.websiteName || '').trim();

    return result;
  }

  /** @param {{ title: string, author: string, feedName: string }} metadata */
  function populateDimensions(metadata) {
    modalDimensionSelect.innerHTML = '';

    if (metadata.title) {
      addOption('intitle', i18n.dimensionTitle, metadata.title);
    }
    if (metadata.author) {
      addOption('author', i18n.dimensionAuthor, metadata.author);
    }
    addOption('custom', i18n.dimensionCustom, '');
  }

  /**
   * @param {string} value
   * @param {string} label
   * @param {string} prefill
   */
  function addOption(value, label, prefill) {
    var opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    opt.dataset.prefill = prefill;
    modalDimensionSelect.appendChild(opt);
  }

  function onDimensionChange() {
    var selected = modalDimensionSelect.options[modalDimensionSelect.selectedIndex];
    var prefill = selected ? (selected.dataset.prefill || '') : '';
    modalExpressionInput.value = prefill;
    updatePreview();
    modalExpressionInput.focus();
  }

  function updatePreview() {
    if (isSubmitting) return;
    var expression = modalExpressionInput.value.trim();
    var dimension, ruleText;

    if (!expression) {
      modalPreview.textContent = i18n.previewPlaceholder;
      modalPreview.classList.add('fbfb-preview-placeholder');
      modalSubmitBtn.disabled = true;
      return;
    }

    modalSubmitBtn.disabled = false;
    modalPreview.classList.remove('fbfb-preview-placeholder');

    dimension = modalDimensionSelect.value;
    if (dimension === 'custom') {
      ruleText = expression;
    } else {
      ruleText = dimension + ':' + quoteValue(expression);
    }

    modalPreview.textContent = ruleText;
  }

  /** @param {string} val */
  function quoteValue(val) {
    var hasSingle = val.indexOf("'") !== -1;
    var hasDouble = val.indexOf('"') !== -1;
    var hasSpace = /\s/.test(val);

    if (!hasSpace && !hasSingle && !hasDouble) return val;
    if (!hasSingle) return "'" + val + "'";
    if (!hasDouble) return '"' + val + '"';
    return "'" + val.replace(/'/g, "\\'") + "'";
  }

  function onSubmitClick() {
    var expression = modalExpressionInput.value.trim();
    var dimension, ruleText;
    if (!expression) return;

    dimension = modalDimensionSelect.value;
    if (dimension === 'custom') {
      ruleText = expression;
    } else {
      ruleText = dimension + ':' + quoteValue(expression);
    }

    if (typeof window.FeedBlockFilterBuilder.submitRule === 'function') {
      window.FeedBlockFilterBuilder.submitRule(modalCurrentFeedId, ruleText);
    } else {
      showNotification(i18n.errorNotReady, 'bad');
    }
  }

  window.FeedBlockFilterBuilder = window.FeedBlockFilterBuilder || {};
  window.FeedBlockFilterBuilder.showNotification = showNotification;
  window.FeedBlockFilterBuilder.extractFeedId = extractFeedId;
  window.FeedBlockFilterBuilder.i18n = function () { return i18n; };
  window.FeedBlockFilterBuilder.openModal = openModal;
  window.FeedBlockFilterBuilder.closeModal = closeModal;
  window.FeedBlockFilterBuilder.setSubmitting = function (submitting) {
    if (!modalSubmitBtn) return;
    isSubmitting = submitting;
    modalSubmitBtn.disabled = submitting;
    modalSubmitBtn.textContent = submitting ? i18n.submitting : i18n.submitBtn;
  };

  document.addEventListener('freshrss:globalContextLoaded', init);
})();
