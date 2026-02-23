# Spec: css-fix

## MODIFIED Requirements

### Requirement: cancel-button-styling

The cancel button MUST NOT have its styles overridden by the generic `.fbfb-btn` class. The `.fbfb-btn-cancel` styles (padding, border, background) MUST take effect.

#### Scenario: cancel button renders with correct padding and border

- WHEN the modal is open and the cancel button is visible
- THEN the cancel button SHALL have `padding: 5px 14px` and `border: 1px solid`
- THEN the cancel button SHALL NOT have `padding: 2px 4px` or `border: none`

### Requirement: fix-approach

The fix MUST use one of these approaches:
- Remove `fbfb-btn` from the cancel button's className in `script.js` (preferred — minimal change)
- OR reorder CSS so `.fbfb-btn-cancel` comes after `.fbfb-btn`
- OR increase `.fbfb-btn-cancel` specificity

The chosen approach MUST NOT break the submit button styling.

#### Scenario: submit button is unaffected

- WHEN the modal is open
- THEN the submit button SHALL retain its existing `.fbfb-btn-submit` styles
