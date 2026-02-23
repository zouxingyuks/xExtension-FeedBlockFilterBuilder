# Spec: i18n-refactor

## MODIFIED Requirements

### Requirement: remove-hardcoded-i18n

The `extension.php` MUST NOT contain hardcoded translation strings. The `getI18nStrings()` method MUST be removed.

#### Scenario: extension.php has no hardcoded translations

- WHEN reviewing `extension.php` source code
- THEN there SHALL be no hardcoded Chinese or English translation arrays in the file

### Requirement: read-from-i18n-directory

The `extension.php` `jsVars()` method MUST read translations from `i18n/{lang}/ext.php` files using direct file inclusion mechanism.

#### Scenario: jsVars loads translations from i18n files

- WHEN the extension initializes on a Chinese locale
- THEN `window.context.extensions.feedBlockFilterBuilder.i18n` SHALL contain Chinese strings from `i18n/zh/ext.php`
- WHEN the extension initializes on an English locale
- THEN `window.context.extensions.feedBlockFilterBuilder.i18n` SHALL contain English strings from `i18n/en/ext.php`

### Requirement: consistent-zh-translations

The `i18n/zh/ext.php` `errorNotReady` value MUST be updated to `'扩展尚未就绪，请稍后重试'`. The remaining 20 keys are already consistent and MUST NOT be changed.
- `errorNotReady` MUST be changed to `'扩展尚未就绪，请稍后重试'`

#### Scenario: Chinese errorNotReady is corrected

- WHEN comparing `i18n/zh/ext.php` errorNotReady value
- THEN `errorNotReady` SHALL be `'扩展尚未就绪，请稍后重试'`
