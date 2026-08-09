# Components

Platform-agnostic recipes. Sizes are given as relationships and as the value at
**open density** (web / dashboard); at compact and micro density scale the type
down per `IDENTITY.md` and keep every other rule intact.

---

## Surface

Background `void`. Panels and cards `panel`, separated by a 1px `border` line —
never by a shadow and never by a radius. Optional background texture: the plasma
radials under a 4px dither, both off in the kill state, and never under small text.

Page rhythm comes from the 4-based spacing scale only: `4 6 7 8 9 10 11 12 14 16 18
20 22 24 26` (and multiples of 4 above that for open density).

## Type

| Role | Face | Open density | Notes |
|---|---|---|---|
| Hero number | Silkscreen 700 | 64–220px | the one element that may carry skew |
| Display / heading | Silkscreen 700 | 20–46px | caps, `letter-spacing .06em` |
| Label / micro-label | Silkscreen 700 | 11–14px | caps, `.08–.1em`, section headers in `yellow` |
| Prose | IBM Plex Mono 400 | 15–17px | `line-height 1.6–1.7`, `textPrimary` |
| Secondary prose | IBM Plex Mono 400 | 14–15px | `textSecondary` |
| Data in tables | Silkscreen 700 | 14–18px | tabular by nature |

`textTertiary` is for uppercase micro-labels only — never prose; it sits at 3.0:1.
Silkscreen never sets a sentence at any size.

## Buttons

- **Primary** — 2px gradient frame (frame variant), solid `void` interior, label in
  `#fff`, hard shadow `4px 4px 0 magenta`. Padding 9–14 vertical.
- **Secondary** — 2px `cyan` stroke at 40–45% opacity, transparent fill, label
  `textPrimary`.
- **Loud** — solid `yellow` or `cyan` fill with `void` label, hard shadow. Use once
  per surface at most.
- **Disabled** — 1px `borderSoft`, label `textTertiary`, no shadow, no animation.

Never a gradient fill. Never a radius. Press state: shadow offset drops to 0 and the
button translates by the same amount, so it looks pushed into the surface.

## Frames and cards

Chrome card: `panel` fill, 1px `border`. Hierarchy card: 2px coloured border plus a
hard shadow of the same colour at 25–30%. Featured card: the frame variant, so the
border itself drifts. At most one drifting frame per viewport.

## Inputs

Fill `panel`, 1px `border`, padding 7–12, prose face. Focus: border becomes 2px
`cyan` — no glow, no ring, no transition longer than 120ms. Error: 2px `magenta`
plus a magenta prose line beneath. Labels above, caps micro-label.

Toggle: a 30×14 rectangle with a 12×12 square knob, both radius 0. On = `cyan`
track, `void` knob.

Segmented control: equal-width items, 1px `border`, `textTertiary` labels; the
active item takes a solid `yellow` fill with a `void` label. Optionally a shared
field across the whole row.

## Data display

**Hero metric** — the full Mix plus skew, with a caps label beside or above it and
a flat prose line of context beneath. One per surface.

**Bar chart** — shared field, always. Bars 4–14px wide at compact density, 12–28px
at open; `min-height` 2–3px so an empty day still reads as a bar. No data: flat
`rgba(255,255,255,.18)`, no gradient, no animation. Axis labels are caps
micro-labels at the extremes only — no gridlines, ever.

**Sparkline** — the same, without labels, height 22–40.

**Table** — 1px `border` row rules, caps micro-label header row, data in Silkscreen,
prose in Plex Mono. No zebra striping. Row hover: `panel` fill.

**Status dot** — an 8×8 square (never a circle) in the semantic colour, blinking
`steps(2)` over 1.4s when it means "live". Steps, not a fade: the identity has no
soft transitions.

## Navigation

Caps labels, 1px `border` divider, active item marked by a 2px `cyan` edge on the
leading side — not by a fill and not by a pill. Breadcrumbs and back links as
`< LABEL` in `cyan`.

## Semantic colour

`cyan` normal / live · `yellow` attention · `magenta` urgent · `violet` scheduled ·
`green` and `orange` are gradient stops and are not semantic on their own.

**When the data itself is the alarm, its colour is fixed and does not drift.** A
low-balance number goes flat `yellow`, not gradient — the Mix would make the alarm
prettier and less legible at the same time. This exception is part of the identity,
not a deviation from it.

## Motion inventory

The whole system, and nothing beyond it:

| What | Duration | Curve |
|---|---|---|
| Gradient drift | T / 10 s | linear |
| Ghost cross | 2.1s | ease-in-out |
| Hero skew | 3.4s | ease-in-out |
| Live dot | 1.4s | steps(2) |
| State change (focus, hover, press) | ≤ 120ms | linear |
| Screen transition | 280ms | snappy / ease-out |

No parallax, no scroll-driven animation, no entrance animation, no easing curve with
overshoot. Anything not on this list needs a reason written down next to it.
