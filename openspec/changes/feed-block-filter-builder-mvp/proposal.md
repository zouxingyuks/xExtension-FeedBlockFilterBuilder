## Why

FreshRSS 原生支持 per-feed filter actions（过滤规则自动标记已读），但配置入口深藏在订阅源编辑页面中，用户需要：导航到订阅管理 → 找到目标订阅源 → 编辑 → 滚动到过滤规则区域 → 手写过滤语法。这个流程打断了阅读体验，且要求用户记忆 FreshRSS 的搜索语法（`intitle:`、`author:` 等）。

本扩展在文章阅读界面提供一键式过滤规则构建器，让用户在看到不想要的文章时，直接从当前文章的元数据快速生成过滤规则，写入 FreshRSS 原生 filter actions 系统。

> **English summary**: FreshRSS has native per-feed filter actions, but the configuration is buried deep in the subscription edit page. This extension surfaces a one-click filter rule builder directly in the article reading interface, letting users quickly generate block rules from article metadata without leaving their reading flow.

## What Changes

- 在每篇文章的工具栏中新增「屏蔽过滤」按钮
- 点击按钮弹出 Modal 构建器，自动从当前文章预填充可用字段：
  - **标题** (`intitle:`)：从文章标题提取关键词
  - **作者** (`author:`)：从文章作者字段提取
- 用户选择过滤维度、编辑过滤表达式后，一键提交
- 提交保证：规则作为新行追加到当前文章所属 feed 的 `filteractions_read`，不覆盖已有规则
- 遵循 FreshRSS 原生搜索语法（`intitle:`、`author:`、正则 `/ /` 等），不引入新语法
- 提交成功后显示确认通知，失败时显示错误提示
- 支持中英双语 i18n

## Non-goals

- **不做规则管理**：不提供已有规则的查看、编辑、删除功能（使用 FreshRSS 原生订阅编辑页面管理）
- **不做跨 feed 批量操作**：每次仅为当前文章所属 feed 创建规则
- **不在非阅读页面提供入口**：不在订阅源编辑页面、分类管理等页面添加构建器
- **不做全局规则**：MVP 仅支持 per-feed filter actions，不涉及全局或分类级别过滤
- **不扩展 FreshRSS 语法**：严格使用原生搜索语法，不添加自定义操作符

## Capabilities

### New Capabilities

- `article-toolbar-button`: 文章工具栏注入屏蔽按钮
  - 按钮出现在每篇文章的 `.flux_header` 工具栏区域
  - 点击按钮打开 filter-builder-modal
  - 按钮图标和 tooltip 支持 i18n

- `filter-builder-modal`: Modal 弹窗构建器 UI
  - 打开时从当前文章 DOM 提取元数据预填充（标题、作者）
  - 若某字段在文章中不存在，该预填选项不显示
  - 提供过滤维度选择（intitle / author）
  - 提供表达式编辑区，用户可修改预填内容或手写原生语法
  - 实时预览最终将写入的过滤规则文本
  - 提供提交和取消按钮

- `filter-rule-submission`: 过滤规则写入 FreshRSS 原生系统
  - 获取当前 feed 的已有 `filteractions_read` 内容
  - 将新规则追加为新行（不覆盖已有规则）
  - 通过模拟 POST 到 `?c=subscription&a=feed&id={feedId}` 提交
  - 提交需携带有效 CSRF token 和完整表单字段
  - 成功时显示原生风格的确认通知
  - 失败时显示错误提示，不丢失用户输入

### Modified Capabilities
<!-- 无，本项目为全新扩展 -->

## Impact

- **前端 DOM**：向 `.flux_header .item.bar` 区域注入自定义按钮；在 `<body>` 下追加 Modal DOM 元素
- **FreshRSS 原生系统**：通过模拟 POST 到 `?c=subscription&a=feed&id={feedId}` 写入 `filteractions_read`，依赖 FreshRSS 原生表单结构稳定性
- **表单模拟依赖项**：
  - CSRF token：需从 FreshRSS 前端全局上下文对象 `window.context.csrf`（由 `js_vars` hook 注入）获取有效 token
  - 隐藏表单字段：POST 需包含 feed 编辑表单的所有必填字段（name、url、category 等），否则可能清空已有配置
  - 会话/认证：用户必须已登录，操作在当前用户权限范围内
  - 响应处理：原生表单提交返回 HTML 重定向，需处理非 AJAX 响应
- **国际化**：新增 `i18n/zh/ext.php` 和 `i18n/en/ext.php` 翻译资源文件
- **依赖**：无外部依赖，纯 vanilla JS/CSS 实现
- **兼容性**：需要 FreshRSS 1.20+（hook 系统稳定版本）
- **风险**：
  - 前端模拟表单提交依赖 FreshRSS 订阅编辑页面的表单字段名（`filteractions_read`）和路由（`?c=subscription&a=feed`）不变，FreshRSS 大版本升级可能需要适配
  - 若 POST 缺少必填字段，可能意外修改 feed 的其他配置——需确保完整回传所有原始字段值
