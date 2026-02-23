# FeedBlockFilterBuilder

一个 FreshRSS 扩展，在每篇文章行上添加快捷过滤按钮，让你无需离开阅读界面即可为订阅源创建屏蔽过滤规则。

## 功能特性

- 在每篇文章标题栏添加漏斗图标按钮
- 点击后在按钮旁弹出下拉式弹窗
- 自动提取文章标题和作者作为过滤维度
- 支持自定义过滤表达式
- 实时预览生成的过滤规则
- 通过 API 直接提交规则到订阅源的过滤设置
- 重复规则检测
- 国际化支持（中文 / 英文）

## 项目状态

> ⚠️ 早期开发阶段（v0.1.0），核心功能可用，可能存在细节问题。

## 目录结构

```
xExtension-FeedBlockFilterBuilder/
├── extension.php          # 扩展入口，注册钩子并注入国际化数据
├── metadata.json          # 扩展元数据
├── i18n/
│   ├── en/                # 英文翻译
│   └── zh/                # 中文翻译
└── static/
    ├── script.js          # 主逻辑 - 按钮注入、弹窗、规则提交
    └── style.css          # 弹窗和按钮样式
```

## 运行要求

- FreshRSS >= 1.20.0

## 安装方式

1. 下载或克隆本仓库到 FreshRSS 扩展目录：

   ```bash
   cd /path/to/FreshRSS/extensions
   git clone https://github.com/your-repo/xExtension-FeedBlockFilterBuilder.git
   ```

2. 在 FreshRSS 中启用扩展：

   **设置 → 扩展 → FeedBlockFilterBuilder → 启用**

## 使用说明

1. 正常浏览文章列表
2. 点击任意文章行上的漏斗图标（▽）
3. 弹出下拉弹窗，包含：
   - **过滤维度** 选择器 — 可选标题、作者或自定义
   - **表达式** 输入框 — 根据维度自动填充，可编辑
   - **预览** — 显示最终将添加的过滤规则
4. 点击 **添加** 将规则提交到该订阅源的屏蔽过滤设置
5. 规则即时保存，无需跳转到订阅源设置页面

## 兼容性说明

- 已在 FreshRSS 默认主题下测试
- 按钮以 `<li class="item manage">` 元素注入，匹配现有标题栏结构
- 弹窗使用 `position: fixed` 定位，相对于触发按钮显示

## 许可证

[MIT](LICENSE)
