# Proposal: fix-project-hygiene

## Why

项目核心功能已基本完成，但缺少标准开源项目必备的基础设施文件（`.gitignore`、`LICENSE`），存在 i18n 架构冗余（extension.php 硬编码翻译 + i18n/ 目录文件并存），metadata 信息不准确，以及 CSS 选择器冲突导致取消按钮样式异常。这些问题影响项目的可维护性和发布质量。

## What Changes

1. 添加 `.gitignore` 文件，排除 `.idea/`、`.claude/`、`openspec/` 等非项目文件
2. 添加 MIT `LICENSE` 文件
3. 修正 `metadata.json` 的 `author` 字段为 `xyzou`
4. 重构 `extension.php` 的 i18n 机制：移除硬编码翻译，改为读取 `i18n/` 目录下的标准 FreshRSS 翻译文件
5. 统一中文翻译（`i18n/zh/ext.php` 与原 extension.php 硬编码内容对齐）
6. 修复 CSS 中 `.fbfb-btn` 与 `.fbfb-btn-cancel` 的选择器冲突

## Capabilities

### Modified

- **i18n-refactor**: 将 extension.php 的硬编码 i18n 改为读取 i18n/ 目录文件，统一中文翻译
- **css-fix**: 修复 `.fbfb-btn` 和 `.fbfb-btn-cancel` 的 CSS 选择器冲突
- **project-files**: 添加 `.gitignore`、`LICENSE`，修正 `metadata.json` author 字段

## Impact

- **extension.php**: 重构 `jsVars()` 和移除 `getI18nStrings()` 方法
- **i18n/zh/ext.php**: 可能需要更新个别翻译字符串以保持一致
- **static/style.css**: 修改 `.fbfb-btn` 或 `.fbfb-btn-cancel` 的 class/选择器
- **static/script.js**: 取消按钮的 className 可能需要同步调整
- **metadata.json**: author 字段变更
- **新增文件**: `.gitignore`、`LICENSE`
