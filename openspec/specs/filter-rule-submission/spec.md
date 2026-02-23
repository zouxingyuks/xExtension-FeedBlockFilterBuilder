# filter-rule-submission Specification

## Purpose
TBD - created by archiving change feed-block-filter-builder-mvp. Update Purpose after archive.
## Requirements
### Requirement: 获取已有过滤规则
提交前系统 SHALL 获取当前 feed 的已有 `filteractions_read` 内容，确保追加而非覆盖。

#### Scenario: 成功获取已有规则
- **WHEN** 用户点击提交按钮
- **THEN** 系统 MUST 先通过 GET 请求获取当前 feed 的订阅编辑页面（`?c=subscription&a=feed&id={feedId}`）
- **AND** 从响应 HTML 中解析出 `filteractions_read` textarea 的现有内容
- **AND** 从响应 HTML 中解析出所有必填表单字段的当前值

#### Scenario: 获取失败处理
- **WHEN** GET 请求获取 feed 编辑页面失败（网络错误、权限不足等）
- **THEN** 系统 MUST 显示错误通知（通过 FreshRSS 页面内通知机制，可通过 `.notification.bad` 选择器定位）
- **AND** Modal MUST 保持打开状态，不丢失用户输入
- **AND** 系统 MUST NOT 尝试提交规则

#### Scenario: 获取成功但解析失败
- **WHEN** GET 请求成功但响应 HTML 中不包含 `filteractions_read` textarea（如返回登录页、错误页、或 FreshRSS 版本不兼容）
- **THEN** 系统 MUST 显示错误通知（`.notification.bad`）
- **AND** Modal MUST 保持打开状态，不丢失用户输入
- **AND** 系统 MUST NOT 尝试提交规则

### Requirement: 规则追加逻辑
系统 SHALL 将新规则作为新行追加到已有 `filteractions_read` 内容末尾。

#### Scenario: 追加到已有规则
- **WHEN** 当前 feed 已有过滤规则（如 `intitle:spam`）且用户提交新规则 `author:bot`
- **THEN** 提交的 `filteractions_read` 值 MUST 为原有内容加换行加新规则（`intitle:spam\nauthor:bot`）
- **AND** 原有规则 MUST NOT 被修改或删除
- **AND** 拼接时 MUST 确保原有内容末尾恰好有一个换行符（去除多余空行）

#### Scenario: 首条规则写入
- **WHEN** 当前 feed 没有已有过滤规则且用户提交新规则 `intitle:广告`
- **THEN** 提交的 `filteractions_read` 值 MUST 仅包含新规则（`intitle:广告`）

#### Scenario: 防止重复规则
- **WHEN** 用户提交的规则与已有规则完全相同
- **THEN** 系统 MUST 提示用户该规则已存在
- **AND** 系统 MUST NOT 重复写入相同规则

### Requirement: 表单模拟提交
系统 SHALL 通过 POST 请求模拟 FreshRSS 原生订阅编辑表单提交，将规则写入 feed 配置。

#### Scenario: 成功提交
- **WHEN** 系统发送 POST 到 `?c=subscription&a=feed&id={feedId}`
- **AND** 请求包含有效 CSRF token（从 `window.context.csrf` 获取）
- **AND** 请求包含完整的表单字段（从 GET 响应中解析的所有原始字段值 + 更新后的 `filteractions_read`）
- **THEN** FreshRSS MUST 接受提交并更新 feed 的过滤规则
- **AND** 系统 MUST 显示成功通知（通过 FreshRSS 页面内通知机制，可通过 `.notification.good` 选择器定位）
- **AND** Modal MUST 自动关闭

#### Scenario: CSRF token 无效
- **WHEN** POST 请求因 CSRF token 无效被拒绝
- **THEN** 系统 MUST 显示错误通知（`.notification.bad`）
- **AND** Modal MUST 保持打开状态，不丢失用户输入

#### Scenario: 提交失败 - 网络错误
- **WHEN** POST 请求因网络错误失败
- **THEN** 系统 MUST 显示错误通知（`.notification.bad`）
- **AND** Modal MUST 保持打开状态，不丢失用户输入

### Requirement: Feed ID 提取
系统 SHALL 从当前文章的 DOM 中正确提取所属 feed 的 ID。

#### Scenario: 从文章 DOM 提取 feed ID
- **WHEN** 系统需要确定当前文章所属的 feed
- **THEN** 系统 MUST 从文章 DOM 中的 feed 链接（`.website > a` 的 href 中包含 `f_{feedId}`）提取 feed ID
- **AND** 提取的 feed ID MUST 为有效的数字 ID

#### Scenario: 无法提取 feed ID
- **WHEN** 文章 DOM 中无法找到有效的 feed ID
- **THEN** 系统 MUST 显示错误通知（`.notification.bad`）
- **AND** 系统 MUST NOT 尝试提交规则

### Requirement: 完整表单字段回传
提交时 MUST 回传 feed 编辑表单的所有原始字段值，仅修改 `filteractions_read` 字段。

#### Scenario: 保留原始配置
- **WHEN** 系统提交更新后的过滤规则
- **THEN** POST 请求 MUST 包含从 GET 响应中解析的所有表单字段原始值
- **AND** 除 `filteractions_read` 外的所有字段值 MUST 与原始值完全一致
- **AND** feed 的名称、URL、分类、更新频率等配置 MUST NOT 被意外修改

