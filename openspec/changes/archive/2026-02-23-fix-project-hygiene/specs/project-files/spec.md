# Spec: project-files

## MODIFIED Requirements

### Requirement: gitignore

The project MUST have a `.gitignore` file that excludes:
- `.idea/`
- `.claude/`
- `openspec/changes/*/archive/`
- `*.swp`
- `.DS_Store`

#### Scenario: gitignore excludes IDE and tool directories

- WHEN a developer clones the repository
- THEN `.idea/`, `.claude/` directories and `openspec/changes/*/archive/` paths SHALL NOT be tracked by git

### Requirement: license

The project MUST have a `LICENSE` file containing the MIT license text with copyright holder `xyzou`, year 2026.

#### Scenario: LICENSE file exists and is valid

- WHEN a user views the repository
- THEN a `LICENSE` file SHALL exist at the project root with MIT license text

### Requirement: metadata-author

The `metadata.json` `author` field MUST be `"xyzou"` instead of the repository name.

#### Scenario: metadata author is correct

- WHEN FreshRSS reads `metadata.json`
- THEN the `author` field SHALL be `"xyzou"`
