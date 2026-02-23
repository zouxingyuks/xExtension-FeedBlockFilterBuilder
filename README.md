# FeedBlockFilterBuilder

A FreshRSS extension that adds a quick filter button to each article row, allowing you to create block filter rules for feeds without leaving the reading view.

## Features

- Adds a filter icon (funnel) button to every article header
- Click to open a dropdown modal next to the button
- Auto-extracts article title and author as filter dimensions
- Supports custom filter expressions
- Live preview of the generated filter rule
- Submits the rule directly to the feed's filter settings via API
- Duplicate rule detection
- i18n support (English / Chinese)

## Project Status

> ⚠️ Early development (v0.1.0). Core functionality works but may have rough edges.

## Directory Structure

```
xExtension-FeedBlockFilterBuilder/
├── extension.php          # Extension entry point, registers hooks and injects i18n
├── metadata.json          # Extension metadata
├── i18n/
│   ├── en/                # English translations
│   └── zh/                # Chinese translations
└── static/
    ├── script.js          # Main JS - button injection, modal, rule submission
    └── style.css          # Modal and button styles
```

## Requirements

- FreshRSS >= 1.20.0

## Installation

1. Download or clone this repository into your FreshRSS extensions directory:

   ```bash
   cd /path/to/FreshRSS/extensions
   git clone https://github.com/your-repo/xExtension-FeedBlockFilterBuilder.git
   ```

2. Enable the extension in FreshRSS:

   **Settings → Extensions → FeedBlockFilterBuilder → Enable**

## Usage

1. Browse your articles in the normal reading view
2. Click the funnel icon (▽) on any article row
3. A dropdown modal appears with:
   - **Dimension** selector — choose Title, Author, or Custom
   - **Expression** input — auto-filled based on dimension, editable
   - **Preview** — shows the final filter rule that will be added
4. Click **Add** to submit the rule to the feed's block filter settings
5. The rule is saved immediately — no need to visit the feed settings page

## Compatibility Notes

- Tested with FreshRSS default themes
- The button is injected as a `<li class="item manage">` element to match the existing header structure
- Uses `position: fixed` dropdown positioning relative to the trigger button

## License

[MIT](LICENSE)
