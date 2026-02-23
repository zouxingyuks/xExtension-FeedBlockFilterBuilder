'use strict';

(function () {
  /** @type {object} */
  var i18n = null;

  var ICON_SVG = '<svg class="icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>';

  var BUTTON_MARKER = 'fbfb-filter-btn';

  /** @param {HTMLElement} flux */
  function injectButton(flux) {
    var header = flux.querySelector('.flux_header');
    if (!header) return;
    if (header.querySelector('.' + BUTTON_MARKER)) return;

    var btn = document.createElement('a');
    btn.className = BUTTON_MARKER;
    btn.href = '#';
    btn.title = (i18n && i18n.buttonTooltip) || 'Add filter';
    btn.setAttribute('aria-label', btn.title);
    btn.innerHTML = ICON_SVG;

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      onFilterButtonClick(flux);
    });

    var li = document.createElement('li');
    li.className = 'item manage';
    li.appendChild(btn);

    var manageItems = header.querySelectorAll('.item.manage');
    var anchor = manageItems.length >= 2 ? manageItems[1] : manageItems[0];
    if (anchor && anchor.nextSibling) {
      header.insertBefore(li, anchor.nextSibling);
    } else {
      header.insertBefore(li, header.firstChild);
    }
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
    var triggerBtn;
    if (!feedId) {
      showNotification((i18n && i18n.errorNoFeedId) || 'Cannot get feed ID', 'bad');
      return;
    }
    if (typeof window.FeedBlockFilterBuilder !== 'undefined' &&
        typeof window.FeedBlockFilterBuilder.openModal === 'function') {
      triggerBtn = flux.querySelector('.' + BUTTON_MARKER + ' a, .' + BUTTON_MARKER);
      window.FeedBlockFilterBuilder.openModal(flux, feedId, triggerBtn);
    } else {
      showNotification((i18n && i18n.errorNotReady) || 'Extension not ready', 'bad');
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

  function getI18n() {
    var ext, data;
    if (!i18n || Object.keys(i18n).length === 0) {
      ext = window.context &&
            window.context.extensions &&
            window.context.extensions.feedBlockFilterBuilder;
      data = (ext && ext.i18n) ? ext.i18n : null;
      if (data && Object.keys(data).length > 0) {
        i18n = data;
      } else {
        i18n = i18n || {};
      }
    }
    return i18n;
  }

  function init() {
    getI18n();
    createModal();
    injectAllButtons();
    observeNewArticles();
  }

  var modal = null;
  var modalOverlay = null;
  var modalTitleEl = null;
  var modalDimensionLabelEl = null;
  var modalExpressionLabelEl = null;
  var modalPreviewLabelEl = null;
  var modalCancelBtn = null;
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

    modalTitleEl = document.createElement('h3');
    modalTitleEl.className = 'fbfb-modal-title';

    modalDimensionLabelEl = document.createElement('label');
    modalDimensionLabelEl.className = 'fbfb-label';

    modalDimensionSelect = document.createElement('select');
    modalDimensionSelect.className = 'fbfb-select';
    modalDimensionSelect.addEventListener('change', onDimensionChange);

    modalExpressionLabelEl = document.createElement('label');
    modalExpressionLabelEl.className = 'fbfb-label';

    modalExpressionInput = document.createElement('input');
    modalExpressionInput.type = 'text';
    modalExpressionInput.className = 'fbfb-input';
    modalExpressionInput.addEventListener('input', updatePreview);

    modalPreviewLabelEl = document.createElement('label');
    modalPreviewLabelEl.className = 'fbfb-label';

    modalPreview = document.createElement('div');
    modalPreview.className = 'fbfb-preview';

    var btnGroup = document.createElement('div');
    btnGroup.className = 'fbfb-btn-group';

    modalSubmitBtn = document.createElement('button');
    modalSubmitBtn.className = 'fbfb-btn-submit';
    modalSubmitBtn.disabled = true;
    modalSubmitBtn.addEventListener('click', onSubmitClick);

    modalCancelBtn = document.createElement('button');
    modalCancelBtn.className = 'fbfb-btn-cancel';
    modalCancelBtn.addEventListener('click', closeModal);

    btnGroup.appendChild(modalSubmitBtn);
    btnGroup.appendChild(modalCancelBtn);

    modal.appendChild(modalTitleEl);
    modal.appendChild(modalDimensionLabelEl);
    modal.appendChild(modalDimensionSelect);
    modal.appendChild(modalExpressionLabelEl);
    modal.appendChild(modalExpressionInput);
    modal.appendChild(modalPreviewLabelEl);
    modal.appendChild(modalPreview);
    modal.appendChild(btnGroup);

    document.body.appendChild(modalOverlay);
    document.body.appendChild(modal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('fbfb-visible')) {
        closeModal();
      }
    });
  }

  function refreshModalLabels() {
    var t = getI18n();
    if (modalTitleEl) modalTitleEl.textContent = t.modalTitle || 'Create Filter Rule';
    if (modalDimensionLabelEl) modalDimensionLabelEl.textContent = t.dimensionLabel || 'Dimension';
    if (modalExpressionLabelEl) modalExpressionLabelEl.textContent = t.expressionLabel || 'Expression';
    if (modalPreviewLabelEl) modalPreviewLabelEl.textContent = t.previewLabel || 'Preview';
    if (modalExpressionInput) modalExpressionInput.placeholder = t.expressionPlaceholder || '';
    if (modalSubmitBtn) modalSubmitBtn.textContent = t.submitBtn || 'Add';
    if (modalCancelBtn) modalCancelBtn.textContent = t.cancelBtn || 'Cancel';
  }

  /**
   * @param {HTMLElement} flux
   * @param {string} feedId
   * @param {HTMLElement} triggerEl
   */
  function openModal(flux, feedId, triggerEl) {
    var rect, modalWidth, left, top;
    modalCurrentFlux = flux;
    modalCurrentFeedId = feedId;
    isSubmitting = false;

    refreshModalLabels();

    var metadata = extractMetadata(flux);
    populateDimensions(metadata);

    modalExpressionInput.value = '';
    modalSubmitBtn.disabled = true;
    var t = getI18n();
    modalPreview.textContent = t.previewPlaceholder || '';
    modalPreview.classList.add('fbfb-placeholder');

    if (triggerEl) {
      rect = triggerEl.getBoundingClientRect();
      modalWidth = 320;
      left = rect.right + 8;
      if (left + modalWidth > window.innerWidth - 8) {
        left = rect.left - modalWidth - 8;
      }
      if (left < 8) left = 8;
      top = rect.top;
      if (top + 300 > window.innerHeight - 8) {
        top = window.innerHeight - 308;
      }
      if (top < 8) top = 8;
      modal.style.left = left + 'px';
      modal.style.top = top + 'px';
    }
    modal.classList.add('fbfb-visible');

    if (modalDimensionSelect.options.length > 0) {
      onDimensionChange();
    }

    modalExpressionInput.focus();
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('fbfb-visible');
    if (modal) modal.classList.remove('fbfb-visible');
    modalCurrentFlux = null;
    modalCurrentFeedId = null;
    isSubmitting = false;
    if (modalExpressionInput) modalExpressionInput.value = '';
    if (modalDimensionSelect) modalDimensionSelect.innerHTML = '';
    if (modalPreview) {
      modalPreview.textContent = '';
      modalPreview.classList.remove('fbfb-placeholder');
    }
    if (modalSubmitBtn) {
      modalSubmitBtn.disabled = true;
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
    var t = getI18n();

    if (metadata.title) {
      addOption('intitle', t.dimensionTitle || 'Title', metadata.title);
    }
    if (metadata.author) {
      addOption('author', t.dimensionAuthor || 'Author', metadata.author);
    }
    addOption('custom', t.dimensionCustom || 'Custom', '');
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
    var t = getI18n();

    if (!expression) {
      modalPreview.textContent = t.previewPlaceholder || '';
      modalPreview.classList.add('fbfb-placeholder');
      modalSubmitBtn.disabled = true;
      return;
    }

    modalSubmitBtn.disabled = false;
    modalPreview.classList.remove('fbfb-placeholder');

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
    var dimension, ruleText, t;
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
      t = getI18n();
      showNotification(t.errorNotReady || 'Extension not ready', 'bad');
    }
  }

  var isRuleSubmitting = false;

  /**
   * @param {string} feedId
   * @returns {string}
   */
  function buildFeedEditUrl(feedId) {
    return '?c=subscription&a=feed&id=' + encodeURIComponent(feedId);
  }

  /**
   * @param {HTMLFormElement} form
   * @returns {URLSearchParams}
   */
  function serializeForm(form) {
    var params = new URLSearchParams();
    var elements = form.elements;
    var i, el, name, options, j, opt;
    for (i = 0; i < elements.length; i++) {
      el = elements[i];
      name = el.name;
      if (!name || el.disabled) continue;
      switch (el.type) {
        case 'checkbox':
        case 'radio':
          if (el.checked) params.append(name, el.value);
          break;
        case 'select-one':
          params.append(name, el.value);
          break;
        case 'select-multiple':
          options = el.options;
          for (j = 0; j < options.length; j++) {
            opt = options[j];
            if (opt.selected) params.append(name, opt.value);
          }
          break;
        case 'submit':
        case 'button':
        case 'image':
        case 'reset':
        case 'file':
          break;
        default:
          params.append(name, el.value);
      }
    }
    return params;
  }

  /**
   * @param {Document} doc
   * @returns {string|null}
   */
  function extractCsrfFromDoc(doc) {
    var el = doc.querySelector('input[name="_csrf"]');
    return el ? el.value : null;
  }

  /**
   * @param {string} feedId
   * @param {string} ruleText
   */
  function submitRule(feedId, ruleText) {
    var url, csrf, FBF;
    var t = getI18n();
    if (isRuleSubmitting) return;
    isRuleSubmitting = true;
    FBF = window.FeedBlockFilterBuilder;
    FBF.setSubmitting(true);

    url = buildFeedEditUrl(feedId);
    csrf = (window.context && window.context.csrf) ? window.context.csrf : null;

    fetch(url, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('fetch_failed');
        return res.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        var form = doc.querySelector('form[action*="subscription"]') ||
                   doc.querySelector('form');
        var filterField, existingRules, lines, params, csrfFromDoc;

        if (!form) throw new Error('form_not_found');
        filterField = form.querySelector('[name="filteractions_read"]');
        if (!filterField) throw new Error('filter_field_not_found');

        existingRules = filterField.value.trim();
        lines = existingRules ? existingRules.split('\n') : [];

        var k, trimmed;
        for (k = 0; k < lines.length; k++) {
          trimmed = lines[k].trim();
          if (trimmed === ruleText.trim()) {
            isRuleSubmitting = false;
            FBF.setSubmitting(false);
            showNotification(t.errorDuplicate || 'Rule already exists', 'bad');
            return;
          }
        }

        lines.push(ruleText.trim());
        filterField.value = lines.join('\n');

        params = serializeForm(form);

        csrfFromDoc = extractCsrfFromDoc(doc);
        if (!csrf) csrf = csrfFromDoc;
        if (csrf) {
          params.set('_csrf', csrf);
        }

        return fetch(url, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
          redirect: 'follow'
        });
      })
      .then(function (res) {
        if (!res) return;
        isRuleSubmitting = false;
        FBF.setSubmitting(false);
        if (res.redirected && res.status === 200) {
          FBF.closeModal();
          showNotification(t.successNotification || 'Rule added', 'good');
        } else {
          showNotification(t.errorSubmit || 'Submit failed', 'bad');
        }
      })
      .catch(function (err) {
        isRuleSubmitting = false;
        FBF.setSubmitting(false);
        if (err && err.message === 'filter_field_not_found') {
          showNotification(t.errorFilterField || 'Filter field not found', 'bad');
        } else if (err && err.message === 'form_not_found') {
          showNotification(t.errorFormNotFound || 'Form not found', 'bad');
        } else {
          showNotification(t.errorNetwork || 'Network error', 'bad');
        }
      });
  }

  window.FeedBlockFilterBuilder = window.FeedBlockFilterBuilder || {};
  window.FeedBlockFilterBuilder.showNotification = showNotification;
  window.FeedBlockFilterBuilder.extractFeedId = extractFeedId;
  window.FeedBlockFilterBuilder.i18n = function () { return i18n; };
  window.FeedBlockFilterBuilder.openModal = openModal;
  window.FeedBlockFilterBuilder.closeModal = closeModal;
  window.FeedBlockFilterBuilder.submitRule = submitRule;
  window.FeedBlockFilterBuilder.setSubmitting = function (submitting) {
    if (!modalSubmitBtn) return;
    isSubmitting = submitting;
    modalSubmitBtn.disabled = submitting;
    var t = getI18n();
    modalSubmitBtn.textContent = submitting ? (t.submitting || '...') : (t.submitBtn || 'Add');
  };

  if (window.context) {
    init();
  } else {
    document.addEventListener('freshrss:globalContextLoaded', init);
  }
})();
