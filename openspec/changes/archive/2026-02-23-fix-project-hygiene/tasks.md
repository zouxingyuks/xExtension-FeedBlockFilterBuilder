# Tasks: fix-project-hygiene

## 1. Project Files

Files: `.gitignore`, `LICENSE`, `metadata.json`

- [x] 1.1 Create `.gitignore` with exclusions for `.idea/`, `.claude/`, `openspec/changes/*/archive/`, `*.swp`, `.DS_Store`
- [x] 1.2 Create `LICENSE` file with MIT license, copyright holder `xyzou`, year 2026
- [x] 1.3 Update `metadata.json` `author` field from `"xExtension-FeedBlockFilterBuilder"` to `"xyzou"`

## 2. i18n Refactor

Files: `i18n/zh/ext.php`, `extension.php`

- [x] 2.1 Update `i18n/zh/ext.php`: change `errorNotReady` to `'扩展尚未就绪，请稍后重试'`
- [x] 2.2 Rewrite `extension.php` `jsVars()` to load translations from `i18n/{lang}/ext.php` via `include`
- [x] 2.3 Remove `getI18nStrings()` method from `extension.php`
- [ ] 2.4 Verify: refresh FreshRSS page with zh locale, confirm modal labels show correct Chinese text

## 3. CSS Fix

Files: `static/script.js`

- [x] 3.1 In `script.js`, change cancel button className from `'fbfb-btn fbfb-btn-cancel'` to `'fbfb-btn-cancel'`
- [ ] 3.2 Verify: open modal, confirm cancel button has correct padding and border styling
