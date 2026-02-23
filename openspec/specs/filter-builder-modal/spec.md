# filter-builder-modal Specification

## Purpose
TBD - created by archiving change feed-block-filter-builder-mvp. Update Purpose after archive.
## Requirements
### Requirement: Modal 弹窗展示
系统 SHALL 以模态弹窗形式展示过滤规则构建器，覆盖在当前阅读界面之上。

#### Scenario: Modal 正常打开
- **WHEN** 用户点击文章工具栏的屏蔽过滤按钮
- **THEN** 系统 MUST 显示一个模态弹窗
- **AND** 弹窗 MUST 包含遮罩层（`opacity` 介于 0.3–0.7）
- **AND** 弹窗 MUST 使用 CSS `position:fixed` + `margin:auto` 或等效方式居中

#### Scenario: Modal 关闭 - 取消按钮
- **WHEN** 用户点击 Modal 的「取消」按钮
- **THEN** Modal MUST 关闭
- **AND** 不产生任何副作用（不提交规则、不修改文章状态）

#### Scenario: Modal 关闭 - 点击遮罩层
- **WHEN** 用户点击 Modal 外部的遮罩层区域
- **THEN** Modal MUST 关闭
- **AND** 不产生任何副作用

#### Scenario: Modal 关闭 - ESC 键
- **WHEN** Modal 处于打开状态且用户按下 ESC 键
- **THEN** Modal MUST 关闭
- **AND** 不产生任何副作用

### Requirement: 文章元数据预填充
Modal 打开时 SHALL 从当前文章的 DOM 中提取元数据，自动预填充到对应的过滤维度字段中。

#### Scenario: 预填充标题
- **WHEN** Modal 为一篇包含标题的文章打开
- **THEN** 标题维度的输入框 MUST 预填充该文章的标题文本
- **AND** 预填充值 MUST 来自文章 DOM 中的标题元素（`.item-element.title`）

#### Scenario: 预填充作者
- **WHEN** Modal 为一篇包含作者信息的文章打开
- **THEN** 作者维度的输入框 MUST 预填充该文章的作者名
- **AND** 预填充值 MUST 来自文章 DOM 中的作者属性（`data-article-authors`）

#### Scenario: 预填充作者 - 多作者处理
- **WHEN** Modal 为一篇包含多个作者（以逗号分隔）的文章打开
- **THEN** 作者维度的输入框 MUST 预填充完整的作者字符串（不做拆分）
- **AND** 预填充值 MUST 来自文章 DOM 中的作者属性（`data-article-authors`）完整文本并去除首尾空白

#### Scenario: 作者名包含单引号
- **WHEN** 作者名包含单引号（如 `O'Brien`）
- **THEN** 生成的表达式 MUST 使用双引号包裹（如 `author:"O'Brien"`）

#### Scenario: 值包含双引号
- **WHEN** 预填充值包含双引号（如 `He said "hello"`）
- **THEN** 生成的表达式 MUST 使用单引号包裹（如 `intitle:'He said "hello"'`）

#### Scenario: 值同时包含单引号和双引号
- **WHEN** 预填充值同时包含单引号和双引号
- **THEN** 生成的表达式 MUST 使用反斜杠转义内部引号（如 `author:'O\'Brien said "hi"'`）

#### Scenario: 缺少作者信息
- **WHEN** Modal 为一篇缺少作者信息（`data-article-authors` 为空或不存在）的文章打开
- **THEN** 作者维度的预填选项 MUST NOT 显示
- **AND** 其他可用维度 MUST 正常显示

#### Scenario: 缺少标题信息
- **WHEN** Modal 为一篇标题元素（`.item-element.title`）文本为空的文章打开
- **THEN** 标题维度的预填选项 MUST NOT 显示
- **AND** 其他可用维度 MUST 正常显示

### Requirement: 过滤维度选择
用户 SHALL 能够选择过滤维度（intitle / author），系统根据选择生成对应的 FreshRSS 原生语法表达式。

#### Scenario: 选择标题维度
- **WHEN** 用户选择「标题」过滤维度
- **THEN** 表达式编辑区 MUST 显示 `intitle:` 前缀加预填充的标题内容
- **AND** 生成的表达式 MUST 符合 FreshRSS 原生搜索语法

#### Scenario: 选择作者维度
- **WHEN** 用户选择「作者」过滤维度
- **THEN** 表达式编辑区 MUST 显示 `author:` 前缀加预填充的作者名
- **AND** 若作者名包含空格，MUST 使用单引号包裹（如 `author:'John Doe'`）

#### Scenario: 切换维度更新表达式
- **WHEN** 用户从「标题」切换到「作者」维度
- **THEN** 表达式编辑区 MUST 更新为对应维度的预填内容
- **AND** 之前的手动编辑内容 MUST 被替换为新维度的预填内容

### Requirement: 表达式编辑
用户 SHALL 能够在表达式编辑区自由修改过滤表达式，支持 FreshRSS 原生搜索语法。

#### Scenario: 编辑预填内容
- **WHEN** 用户在表达式编辑区修改预填充的内容
- **THEN** 系统 MUST 接受用户的修改
- **AND** 规则预览区 MUST 实时反映修改后的表达式

#### Scenario: 手写原生语法
- **WHEN** 用户清空编辑区并手动输入 FreshRSS 原生语法（如 `intitle:/regex/i`）
- **THEN** 系统 MUST 接受任意符合 FreshRSS 语法的输入
- **AND** 规则预览区 MUST 实时显示用户输入的完整表达式

### Requirement: Modal 提交按钮
Modal MUST 提供一个「提交」按钮，点击后触发 `filter-rule-submission` 流程。

#### Scenario: 提交按钮存在
- **WHEN** Modal 处于打开状态
- **THEN** Modal MUST 显示一个「提交」按钮
- **AND** 按钮文本 MUST 根据 i18n 显示（中文「添加规则」/ 英文 "Add Rule"）

### Requirement: 规则预览
Modal MUST 实时显示最终将写入 `filteractions_read` 的完整规则文本。

#### Scenario: 预览反映当前编辑状态
- **WHEN** 用户在表达式编辑区输入或修改内容
- **THEN** 预览区 MUST 实时显示将要写入的完整过滤规则行
- **AND** 预览内容 MUST 与最终提交的规则文本完全一致

#### Scenario: 空表达式时禁用提交
- **WHEN** 表达式编辑区为空
- **THEN** 提交按钮 MUST 处于禁用状态
- **AND** 预览区 MUST 显示占位提示文本（中文「请输入或选择过滤表达式」/ 英文 "Enter or select a filter expression"）

### Requirement: Modal 国际化
Modal 中的所有 UI 文本（标签、按钮、提示）SHALL 支持中英双语。其他语言 MUST 回退到英文。

#### Scenario: 中文环境
- **WHEN** FreshRSS 界面语言为中文
- **THEN** Modal 标题、维度标签、按钮文本、提示信息 MUST 全部显示中文

#### Scenario: 英文环境
- **WHEN** FreshRSS 界面语言为英文
- **THEN** Modal 标题、维度标签、按钮文本、提示信息 MUST 全部显示英文

#### Scenario: 其他语言回退到英文
- **WHEN** FreshRSS 界面语言为非中文、非英文的语言
- **THEN** Modal 所有 UI 文本 MUST 回退显示英文

