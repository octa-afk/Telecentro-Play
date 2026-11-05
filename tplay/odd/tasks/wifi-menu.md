# Wi-Fi network menu

## Objective
Implement the Wi-Fi network-selection screen shown in the supplied reference screenshots.

## Problem
The current settings flow reaches the Wi-Fi option but has no network list or Wi-Fi-specific actions.

## Scope
- Add a Wi-Fi screen with refresh, join-another-network, back, and available-network rows.
- Preserve the existing Sistema → Conexión → Wi-Fi navigation and back restoration.
- Add deterministic browser coverage for entering, rendering, navigating, and leaving the Wi-Fi screen.

## Constraints
- Keep the fixed 1280×720 decoder layout and existing visual language.
- Use the existing `deco_v2.html` runtime and Playwright test style.
- Do not implement real network scanning; use deterministic demo data.

## Checklist
- [x] Add Wi-Fi screen markup and styling.
- [x] Add Wi-Fi state and remote/keyboard navigation behavior.
- [x] Add regression tests and run the focused suite.

## Authorized scope
- `deco_v2.html`
- `test-consistencia.mjs`
- `test-conexion-back.mjs`
- `odd/tasks/wifi-menu.md`

## Acceptance criteria
- Selecting Wi-Fi opens a screen matching the supplied composition: left action buttons and right network list.
- The connected network is visually distinct, locked networks show a lock indicator, and rows are selectable.
- Back returns to the existing Conexión preview without breaking current tests.

## Checks
- `node test-consistencia.mjs`
- `node test-conexion-back.mjs`
- `node test-visual.mjs`

## Progress
Implementation complete in `deco_v2.html` with deterministic demo rows: four SSIDs,
one connected highlight, two lock indicators, left-side actions, and a status line.
Keyboard and remote arrows move between the action and network columns; OK refreshes,
shows the join placeholder, or selects a network in demo state. Back restores the
existing Conexión preview and preserves the established settings return path.

Focused tests were written before implementation and observed RED because `wifiScreen`
did not exist; after implementation they are GREEN. Evidence from the final runs:

- `node test-consistencia.mjs` — **43 OK, 0 FALLA**.
- `node test-conexion-back.mjs` — **all expectations OK**; Wi-Fi screen, focus movement,
  network selection, and preview restoration passed.
- `node test-visual.mjs` — **errors: []**.

## Next step
No implementation step remains. Review the fixed-layout rendering against the supplied
reference screenshots during visual QA; real scanning and credential entry remain out
of scope.
