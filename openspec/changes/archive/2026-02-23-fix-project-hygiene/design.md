# Design: fix-project-hygiene

## Overview

修复项目基础设施缺失、i18n 架构冗余和 CSS 冲突。所有改动均为局部修改，无架构变更。

## project-files

### .gitignore

在项目根目录创建 `.gitignore`，内容：

```
.idea/
.claude/
openspec/changes/*/archive/
*.swp
.DS_Store
```

### LICENSE

在项目根目录创建 `LICENSE`，使用标准 MIT 模板，copyright holder 为 `xyzou`，年份 2026。

### metadata.json

将 `author` 字段从 `"xExtension-FeedBlockFilterBuilder"` 改为 `"xyzou"`。

## i18n-refactor

### 当前问题

`extension.php` 的 `getI18nStrings()` 硬编码了 21 个 zh/en 翻译字符串，同时 `i18n/zh/ext.php` 和 `i18n/en/ext.php` 也各有一套。两套翻译并存且有不一致（如 `errorNotReady`）。

### 设计方案

1. 移除 `getI18nStrings()` 方法
2. 在 `jsVars()` 中，通过 `include` 加载 `i18n/{lang}/ext.php` 文件获取翻译数组
3. 语言检测逻辑保持不变：从 `Minz_Translate::language()` 获取当前语言，匹配 `zh` 前缀则用 zh，否则用 en
4. 从加载的数组中提取 `ext.feedBlockFilterBuilder.*` 下的值，构建扁平 key-value 注入到 `window.context`
5. 更新 `i18n/zh/ext.php` 中 `errorNotReady` 为 `'扩展尚未就绪，请稍后重试'`

### 关键实现

```php
public function jsVars() {
    $lang = Minz_Translate::language();
    $langDir = (strpos($lang, 'zh') === 0) ? 'zh' : 'en';
    $i18nFile = __DIR__ . '/i18n/' . $langDir . '/ext.php';
    $strings = file_exists($i18nFile) ? include($i18nFile) : [];

    $prefix = 'ext.feedBlockFilterBuilder.';
    $i18n = [];
    foreach ($strings as $key => $value) {
        if (strpos($key, $prefix) === 0) {
            $shortKey = substr($key, strlen($prefix));
            $i18n[$shortKey] = $value;
        }
    }

    return [
        'feedBlockFilterBuilder' => ['i18n' => $i18n],
    ];
}
```

## css-fix

### 当前问题

`script.js` 中取消按钮的 className 为 `'fbfb-btn fbfb-btn-cancel'`。在 `style.css` 中 `.fbfb-btn-cancel`（第 90 行）在 `.fbfb-btn`（第 102 行）之前，两者特异性相同，`.fbfb-btn` 后声明覆盖了 `.fbfb-btn-cancel` 的 padding/border/background。

### 设计方案

采用最小改动方案：在 `script.js` 中将取消按钮的 className 从 `'fbfb-btn fbfb-btn-cancel'` 改为 `'fbfb-btn-cancel'`，移除 `fbfb-btn` class。

这样 `.fbfb-btn` 的样式不再应用于取消按钮，`.fbfb-btn-cancel` 的样式完整生效。提交按钮不受影响（它的 class 是 `fbfb-btn-submit`，不含 `fbfb-btn`）。
