## Context

本项目是一个 FreshRSS 扩展（xExtension-FeedBlockFilterBuilder），为文章阅读界面提供快捷的过滤规则构建器。

**当前状态**：FreshRSS 原生 filter actions 功能完善但入口深藏在订阅源编辑页面（`?c=subscription&a=feed&id={id}`），用户需要手写搜索语法。

**技术约束**：
- FreshRSS 扩展只能通过 PHP hooks 和静态资源（JS/CSS）注入前端行为
- 没有专用 API 端点来修改 filter actions，必须模拟原生表单提交
- 前端无法直接访问 feed 配置数据，需通过 GET 请求获取编辑页面 HTML 来提取现有规则

**FreshRSS 扩展结构**：
```
xExtension-FeedBlockFilterBuilder/
├── metadata.json          # 扩展元数据
├── extension.php          # PHP 入口，注册 hooks
├── static/
│   ├── script.js          # 核心前端逻辑
│   └── style.css          # Modal 样式
└── i18n/
    ├── zh/ext.php          # 中文翻译
    └── en/ext.php          # 英文翻译
```

## Goals / Non-Goals

**Goals:**
- 在文章工具栏注入按钮，点击打开 Modal 构建器
- Modal 从文章 DOM 提取标题/作者预填充，用户选择维度并编辑表达式
- 通过模拟 POST 将规则追加到 feed 的 `filteractions_read`，不破坏已有规则和配置
- 纯 vanilla JS/CSS，无外部依赖

**Non-Goals:**
- 规则管理（查看/编辑/删除）
- 全局/分类级别过滤规则
- 自定义搜索语法
- 验证用户输入的查询语义正确性（如正则是否合法、操作符是否存在）——用户对高级语法自行负责

## Decisions

### Decision 1: 通过 GET + POST 模拟表单提交写入规则

**选择**：GET 获取 feed 编辑页面 HTML → 解析现有 `filteractions_read` 和所有表单字段 → 追加新规则 → POST 完整表单回去

**替代方案**：
- A) 直接 POST 只包含 `filteractions_read` 字段 → **拒绝**：FreshRSS 表单处理会将未提交的字段视为空值，可能清空 feed 的其他配置（name、url、category 等）
- B) 通过 PHP 后端 hook 提供自定义 API → **拒绝**：增加后端复杂度，且 FreshRSS 的 `FreshRSS_Feed` model 没有暴露单独修改 filter actions 的公开方法
- C) 直接操作数据库 → **拒绝**：绕过 FreshRSS 业务逻辑，存在数据一致性风险

**表单序列化规范**：
- 使用 `DOMParser` 解析 GET 响应 HTML，定位 `<form>` 元素
- 遍历所有 `<input>`（text/hidden/password）、`<textarea>`、`<select>` 元素，提取 name-value 对
- `<input type="checkbox">`：仅序列化 `checked` 状态的，未勾选的不包含在 POST 中（与浏览器原生行为一致）
- `<select>`：取 `selectedOptions` 的 value
- `<input type="radio">`：仅序列化 `checked` 的那个
- 重复 name（如 `name[]`）：保留为数组
- 编码方式：`application/x-www-form-urlencoded`（与原生 `<form>` 提交一致）
- 仅修改 `filteractions_read` 字段的值，其余字段原样回传

**Rationale**：GET+POST 方式虽然多一次网络请求，但保证了与 FreshRSS 原生行为完全一致。通过完整解析和回传所有表单字段，确保不会因遗漏字段而意外修改 feed 配置。

### Decision 2: 从 DOM 提取文章元数据而非通过后端注入

**选择**：前端 JS 直接从 `.flux` 元素的 DOM 结构提取标题、作者、feed ID

**替代方案**：
- A) 通过 `js_vars` hook 在后端注入文章数据到 `window.context` → **拒绝**：`js_vars` 是全局的，不是 per-entry 的；且文章列表可能有数十篇文章，全部注入数据量过大
- B) 通过 `entry_before_display` hook 在文章 HTML 中注入 data 属性 → **可行但过度**：DOM 中已有足够信息（`.flux_header` 的 `data-website-name`、`data-article-authors`、标题 `<a>` 文本、feed 链接中的 `f_{id}`）

**DOM 数据源映射**：
| 数据 | DOM 来源 | 提取方式 |
|------|----------|----------|
| 文章标题 | `.flux .item-element.title` | `textContent.trim()` |
| 文章作者 | `.flux_header[data-article-authors]` | `dataset.articleAuthors` |
| Feed 名称 | `.flux_header[data-website-name]` | `dataset.websiteName` |
| Feed ID | `.flux_header .website a[href]` | 正则匹配 `f_(\d+)` |

### Decision 3: CSRF token 来源

**选择**：从 `window.context.csrf` 获取

**Rationale**：FreshRSS 通过 `#jsonVars` 元素注入全局上下文，其中包含 CSRF token。这是最可靠的来源，所有原生 AJAX 操作都使用它。

**Fallback**：若 `window.context.csrf` 为空或未定义，从 GET 获取的 feed 编辑页面 HTML 中解析 `<input name="_csrf" value="...">` 作为备选。两者均不可用时，显示错误通知并中止提交。

### Decision 4: Modal 注入方式

**选择**：在 `freshrss:globalContextLoaded` 事件触发后，一次性创建 Modal DOM 并 append 到 `<body>`，所有文章共享同一个 Modal 实例

**替代方案**：
- A) 每次点击按钮动态创建 Modal → **拒绝**：频繁 DOM 操作，需要每次清理
- B) 每篇文章各自创建一个 Modal → **拒绝**：文章列表可能有数十篇，浪费 DOM 节点

**交互流程**：点击按钮时，将当前文章的 `.flux` 元素引用传给 Modal，Modal 从该元素提取数据并预填充。

### Decision 5: 表达式生成策略

**选择**：根据用户选择的维度 + 预填充/编辑的值，按 FreshRSS 原生语法拼接

**规则**：
- `intitle:` 维度：值包含空格时用单引号包裹 → `intitle:'some words'`
- `author:` 维度：值包含空格时用单引号包裹 → `author:'John Doe'`
- 值包含单引号但不含双引号时用双引号包裹 → `author:"O'Brien"`
- 值同时包含单引号和双引号时，使用单引号包裹并将值中的单引号用反斜杠转义 → `intitle:'He said "it\'s done"'`
- 用户也可直接在编辑区手写任意原生语法（包括正则 `/ /`、`OR`、`!` 否定等），此时跳过自动引号处理
- 预览区实时显示最终将写入的规则文本
- **注意**：扩展不验证用户输入的查询语义是否正确（如正则语法是否合法），仅保证格式化输出符合 FreshRSS 搜索语法的引号规则

### Decision 6: 扩展 PHP 层最小化

**选择**：`extension.php` 仅负责注册静态资源和注入必要的 JS 变量，不添加自定义 Controller 或后端逻辑

```php
class FeedBlockFilterBuilderExtension extends Minz_Extension {
    public function init() {
        $this->registerHook('js_vars', [$this, 'jsVars']);
        Minz_View::appendScript($this->getFileUrl('script.js'));
        Minz_View::appendStyle($this->getFileUrl('style.css'));
    }

    public function jsVars($vars) {
        // 注入扩展的 i18n 字符串供前端使用
        $vars['extensions']['feedBlockFilterBuilder'] = [
            'i18n' => [
                'buttonTooltip' => _t('ext.feedBlockFilterBuilder.buttonTooltip'),
                'modalTitle' => _t('ext.feedBlockFilterBuilder.modalTitle'),
                // ... 其他翻译 key
            ],
        ];
        return $vars;
    }
}
```

**Rationale**：所有核心逻辑在前端完成，PHP 层保持最薄。i18n 字符串通过 `js_vars` hook 注入到 `window.context.extensions.feedBlockFilterBuilder.i18n`，前端直接读取。

## Risks / Trade-offs

### [Risk] GET+POST 模拟表单可能因 FreshRSS 版本升级而失效
→ **Mitigation**: 解析 HTML 时使用宽松匹配（querySelector 而非硬编码位置），POST 时回传所有从 GET 解析出的原始字段值。在 metadata.json 中声明最低兼容版本。

### [Risk] GET 请求获取 feed 编辑页面可能返回非预期内容（登录页、权限错误、404）
→ **Mitigation**: 检查响应状态码和内容（是否包含 `filteractions_read` textarea），解析失败时显示 `.notification.bad` 错误通知并保留用户输入。

### [Risk] POST 缺少必填字段导致 feed 配置被意外修改
→ **Mitigation**: 从 GET 响应中解析 feed 编辑表单的所有 `<input>`/`<select>`/`<textarea>` 的 name-value 对，完整回传。仅修改 `filteractions_read` 字段。

### [Risk] DOM 结构变化导致元数据提取失败
→ **Mitigation**: 每个数据源提取失败时优雅降级（标题缺失 → 不显示 intitle 选项；作者缺失 → 不显示 author 选项；feed ID 缺失 → 显示错误通知，不打开 Modal）。

### [Trade-off] 每次提交需要额外一次 GET 请求
→ **Accepted**: 相比直接 POST 的风险（清空配置），多一次 GET 是可接受的代价。用户感知延迟约 200-500ms（同域请求）。

### [Trade-off] 不缓存 feed 编辑页面数据
→ **Accepted**: 每次提交都重新 GET 确保数据最新。缓存会引入一致性问题（用户可能在另一个 tab 修改了 feed 配置）。

### [Risk] 引号/转义处理不当导致规则语义错误
→ **Mitigation**: 明确的引号优先级策略（无特殊字符→不包裹，有空格→单引号，有单引号→双引号，两者都有→单引号+转义）。预览区实时显示最终规则文本，用户可在提交前确认。

### [Risk] 不同 FreshRSS 主题/视图可能改变 DOM 结构
→ **Mitigation**: 使用 FreshRSS 核心 CSS 类名（`.flux`、`.flux_header`、`.item.bar`）而非主题特定选择器。按钮注入前检查目标容器是否存在，不存在则静默跳过。

### [Risk] fetch 请求未携带认证信息导致获取登录页
→ **Mitigation**: 所有 fetch 请求使用 `credentials: 'same-origin'` 确保携带 session cookie。检查响应内容是否包含预期的表单元素，若为登录页/错误页则中止并提示。

### [Risk] 规则追加时换行符处理不一致导致空行或规则丢失
→ **Mitigation**: 追加前先 trim 现有 `filteractions_read` 内容的尾部空白，然后以 `\n` 连接新规则。确保最终文本中每条规则恰好占一行，无空行。

## Open Questions

1. **FreshRSS 表单提交后的响应格式**：原生表单提交返回 302 重定向到 feed 列表页。模拟 POST 时使用 `redirect: 'follow'`，以最终响应的 `response.ok`（HTTP 200）且 `response.redirected === true` 作为成功判定条件。若响应非 200 或未发生重定向，视为失败。
   - **已决定**：使用 `redirect: 'follow'` + 检查 `response.ok && response.redirected`。

2. **并发安全**：如果用户快速连续点击两次提交，两次 GET 可能获取到相同的现有规则，导致第二次 POST 覆盖第一次的新增规则。
   - **倾向**：MVP 阶段通过 UI 层面防护（提交中禁用按钮 + loading 状态），不做后端锁。
