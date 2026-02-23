# article-toolbar-button Specification

## Purpose
TBD - created by archiving change feed-block-filter-builder-mvp. Update Purpose after archive.
## Requirements
### Requirement: 工具栏按钮注入
扩展 SHALL 在每篇文章的 `.flux_header` 工具栏区域注入一个「屏蔽过滤」按钮。按钮 MUST 在文章列表视图和文章展开态（`.flux.active`）中均可见。若 `.flux_header .item.bar` 不存在，按钮 MUST NOT 注入（静默跳过）。

#### Scenario: 按钮在文章列表中可见
- **WHEN** 用户打开 FreshRSS 文章列表页面
- **THEN** 每篇文章的 `.flux_header .item.bar` 区域 MUST 包含一个屏蔽过滤按钮
- **AND** 按钮 MUST 显示一个 SVG 图标（filter/funnel 类）
- **AND** 每篇文章 MUST 仅注入一个屏蔽过滤按钮（动态加载或 DOM 重排时不得重复注入）

#### Scenario: 按钮在展开的文章中可见
- **WHEN** 用户在文章列表中展开某篇文章（`.flux.active`）
- **THEN** 该文章的工具栏中 MUST 仍然显示屏蔽过滤按钮

### Requirement: 按钮点击打开构建器
按钮点击 SHALL 触发 `filter-builder-modal` 的打开，并传递当前文章的上下文信息。

#### Scenario: 点击按钮打开 Modal
- **WHEN** 用户点击某篇文章的屏蔽过滤按钮
- **THEN** 系统 MUST 打开 filter-builder-modal
- **AND** Modal MUST 预填充来源于被点击按钮所在文章的元数据（标题、作者等）

#### Scenario: 点击按钮不影响文章状态
- **WHEN** 用户点击屏蔽过滤按钮
- **THEN** 文章的已读/未读/收藏状态 MUST NOT 发生变化
- **AND** 文章的展开/折叠状态 MUST NOT 发生变化

### Requirement: 按钮国际化
按钮的 tooltip 文本 SHALL 支持中英双语，根据 FreshRSS 当前语言设置自动切换。

#### Scenario: 中文环境下显示中文 tooltip
- **WHEN** FreshRSS 界面语言设置为中文
- **THEN** 按钮 tooltip MUST 显示中文文本（如「屏蔽过滤」）

#### Scenario: 英文环境下显示英文 tooltip
- **WHEN** FreshRSS 界面语言设置为英文
- **THEN** 按钮 tooltip MUST 显示英文文本（如 "Block Filter"）

#### Scenario: 其他语言回退到英文
- **WHEN** FreshRSS 界面语言设置为非中文、非英文的语言
- **THEN** 按钮 tooltip MUST 回退显示英文文本

