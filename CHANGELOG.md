# Changelog

## core 1.1.0 — 2026-08-09

Restructured from a single-app handoff into a portable identity.

- **`IDENTITY.md`** added: five principles, the still-frame recognisability test,
  three density tiers, where the identity does not belong, and the five ways it
  dies.
- **`core/`** now holds everything platform-agnostic — the Mix (with ports for
  CSS, SwiftUI, canvas, Compose, and static output), agnostic component recipes,
  and the tokens.
- **`apps/saldobar/`** now holds everything app-specific: layout trees, the
  instance table, copy, model, and watchOS constraints.
- Two variants named and generalised: **static frame** (widgets, print, email —
  render one frame of the gradient rather than falling back to flat) and the
  **density rule** that open surfaces qualify proportionally less, not more.
- **`core/platforms/`** added — macOS, iOS, watchOS, web. Each states what the
  platform forbids, what it forces, how the Mix degrades there, and its own checks.
  Two rules come out of this: the precedence rule (platform wins on accessibility,
  identity wins on everything else) and the Dynamic Type rule (prose scales freely,
  display type only in integer multiples, and above `.accessibilityLarge` display
  type falls back to the mono and drops the Mix).
- **Governance added** so the identity is versionable: `VERSIONING.md` (what counts
  as breaking for an identity rather than for an API), `CONTRIBUTING.md`, and a real
  generator — `tokens.css` and `PlasmaPixelTokens.swift` are now build output from
  `tokens.json`, not parallel hand-maintained copies.
- Motion inventory closed: six entries, and anything else needs a written reason.

## 1.0.0 — 2026-08-09

First published version.

- **The Mix** formalised as one mechanism with three layers and two scale rules
  (tile = 1.6× block height, 10 px/s), replacing per-element `text-shadow`.
- **Bar charts** moved to a shared gradient field with a per-bar delay; previously
  each bar carried its own gradient, which made colour encode height — information
  the height already carried.
- **Buttons** changed from gradient fill to a 2px gradient stroke with solid
  interior, so the label never passes under magenta.
- **Two deliberate exceptions** recorded: low-balance numbers stay flat yellow, and
  the rule grid takes no skew.
