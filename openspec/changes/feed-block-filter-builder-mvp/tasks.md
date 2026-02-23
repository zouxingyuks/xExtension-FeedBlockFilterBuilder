## 1. 项目脚手架

- [x] 1.1 创建 `metadata.json`（name、entrypoint、author、description、version、type=user、require=FreshRSS 1.20.0+）
- [x] 1.2 创建 `extension.php` 骨架（`FeedBlockFilterBuilderExtension` 类，继承 `Minz_Extension`，注册 `js_vars` hook，加载 `script.js` 和 `style.css`）
- [x] 1.3 实现 `extension.php::jsVars()` 方法：将 i18n 翻译 key-value 注入到 `window.context.extensions.feedBlockFilterBuilder.i18n`，根据用户语言选择 zh/en，非中英回退 en
- [x] 1.4 创建 `i18n/zh/ext.php` 和 `i18n/en/ext.php` 翻译文件（包含所有 UI 文本 key：tooltip、modal 标题、维度标签、按钮文本、通知消息、占位提示等）
- [x] 1.5 创建 `static/script.js` 和 `static/style.css` 空文件

## 2. 文章工具栏按钮注入

- [x] 2.1 在 `script.js` 中监听 `freshrss:globalContextLoaded` 事件，作为扩展初始化入口
- [x] 2.2 实现按钮注入函数：扫描所有 `.flux_header .item.bar`，为每篇文章注入过滤按钮（SVG filter/funnel 图标），确保每篇文章仅注入一个按钮
- [x] 2.3 处理动态加载场景：使用 MutationObserver 监听新文章 DOM 插入，自动为新文章注入按钮
- [x] 2.4 按钮 i18n：从 `window.context.extensions.feedBlockFilterBuilder.i18n` 读取 tooltip 文本
- [x] 2.5 按钮点击事件：提取当前文章的 `.flux` 元素引用，校验 feed ID 可提取性，成功则打开 Modal，失败则显示 `.notification.bad` 通知

## 3. Modal UI 构建

- [x] 3.1 在初始化时一次性创建 Modal DOM 结构并 append 到 `<body>`（遮罩层 + 居中容器 + 标题 + 维度选择 + 表达式编辑区 + 预览区 + 按钮组）
- [x] 3.2 实现 Modal 打开逻辑：接收 `.flux` 元素引用，从 DOM 提取标题（`.item-element.title` textContent）、作者（`data-article-authors`）、feed 名称（`data-website-name`）、feed ID（链接中 `f_(\d+)` 正则匹配）
- [x] 3.3 实现维度选择 UI：根据可用字段动态生成选项（标题存在→显示 intitle 选项，作者存在→显示 author 选项），缺失字段不显示对应选项
- [x] 3.4 实现表达式编辑区：选择维度后预填充对应值，用户可自由编辑；支持手写任意原生语法
- [x] 3.5 实现预览区：实时显示最终将写入的规则文本，表达式为空时显示占位提示文本
- [x] 3.6 实现引号/转义逻辑：无特殊字符→不包裹，有空格→单引号，有单引号→双引号，两者都有→单引号+反斜杠转义
- [x] 3.7 实现提交按钮状态：表达式为空时禁用提交按钮；提交中显示 loading 状态并禁用按钮
- [x] 3.8 实现取消/关闭：点击取消按钮、遮罩层、Escape 键均关闭 Modal 并重置状态
- [x] 3.9 Modal i18n：所有文本从 i18n 对象读取，非中英语言回退英文

## 4. 规则提交逻辑

- [x] 4.1 实现 CSRF token 获取：优先从 `window.context.csrf` 读取，fallback 从 GET 响应 HTML 解析 `<input name="_csrf">`
- [x] 4.2 实现 GET feed 编辑页面：`fetch('?c=subscription&a=feed&id={feedId}', {credentials: 'same-origin'})` → 用 DOMParser 解析响应 HTML
- [x] 4.3 实现 GET 响应校验：检查响应 HTML 是否包含 `filteractions_read` textarea，不存在则判定为异常页面（登录页/权限页/404），显示 `.notification.bad` 通知并中止
- [x] 4.4 实现表单字段解析（text/hidden/textarea）：从 `<form>` 中提取所有 `<input type="text|hidden">` 和 `<textarea>` 的 name-value 对
- [x] 4.5 实现表单字段解析（checkbox/radio）：仅序列化 checked 的 checkbox/radio，未选中的 checkbox 不发送（遵循浏览器原生行为）
- [x] 4.6 实现表单字段解析（select/repeated names）：提取 `<select>` 的 selected option value；处理 `name[]` 形式的重复字段名
- [x] 4.7 实现 CSRF 字段覆盖：在序列化后的表单数据中，用 `window.context.csrf`（或 fallback 解析值）显式覆盖 `_csrf` 字段
- [x] 4.8 实现 `filteractions_read` 追加逻辑：提取现有值 → trim 尾部空白 → 检查重复（完全相同则提示用户） → 以 `\n` 拼接新规则，确保无多余空行
- [x] 4.9 实现 POST 提交：`application/x-www-form-urlencoded` 编码，`credentials: 'same-origin'`，`redirect: 'follow'`
- [x] 4.10 实现成功/失败判定：`response.ok && response.redirected` 为成功 → 显示 `.notification.good` 通知并关闭 Modal；否则显示 `.notification.bad` 通知并保留用户输入
- [x] 4.11 实现提交并发控制：提交期间禁用提交按钮并显示 loading 状态，防止重复 POST
- [x] 4.12 实现异常处理：网络错误、解析失败、CSRF 不可用、异常页面响应等场景均显示 `.notification.bad` 通知

## 5. 样式

- [x] 5.1 实现 Modal 样式：遮罩层（opacity < 1）、居中容器、响应式布局
- [x] 5.2 实现按钮样式：与 FreshRSS 原生工具栏按钮视觉一致
- [x] 5.3 实现预览区样式：等宽字体、与编辑区视觉区分
- [x] 5.4 实现 loading/disabled 状态样式

## 6. 集成验证

- [x] 6.1 在 FreshRSS 实例中安装扩展，验证按钮注入、Modal 交互、规则提交完整流程
- [x] 6.2 验证 i18n 切换（中文/英文）
- [x] 6.3 验证边界场景：作者缺失、标题含特殊字符、重复规则、网络错误
- [x] 6.4 验证不同视图模式（列表视图、展开视图）下按钮均正常显示
