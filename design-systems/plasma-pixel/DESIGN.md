# Plasma Pixel — DESIGN.md

Design system package for the Open Design workspace. The folder lives at
`design-systems/plasma-pixel/`: `manifest.json` owns discovery metadata,
`tokens.css` is the compiled token contract, this file is the design prose,
`components.html` is the executable fixture, and `USAGE.md` is the agent router.

---

## 1. Visual Theme & Atmosphere

A design identity built on one mechanism: **colour that moves through a shape
instead of sitting on it.** Near-black surfaces, pixel type in caps, zero radius,
hard offset shadows — all of it exists to give one moving thing a still surface
to move against.

It comes from the demoscene: the plasma effect, the scrolling copper bar, the
chromatic fringe of a mistuned signal. The motion means **the data is live**,
which is why it is spent only on data and marks, never on decoration.

Recognisable from a still frame: near-black background with one flat panel tone
above it · pixel type in caps for every number and label · one number rendered in
the gradient, everything else flat cyan or grey · a magenta shadow offset
down-right with no blur · not one rounded corner.

## 2. The Mix — the one mechanism

Three stacked layers, each attacking a different property so they never compete.
Applied **all together or not at all**. Anything animated outside this section is
a deviation.

```
mix(text, size, isHero):
    T = round(size × 1.6)          # tile height
    D = T / 10                     # seconds — the gradient always travels 10 px/s
    g = max(1, round(size / 16))   # ghost offset

    container: position relative, width fit-content
        if isHero: skewX 0° → −2.5° → 0°, 3.4s ease-in-out infinite
                   (translateX 0 → 0.5px → 0 riding along)

        GHOST_A  absolute, inset 0 — the same text, magenta, opacity .75
                 translateX +g → −g → +g, 2.1s ease-in-out infinite
        GHOST_B  identical, cyan, animation-delay −1.05s (half phase)
        FILL     in flow — defines the container size
                 the gradient, background-size 100% T, clipped to the text,
                 background-position 0 0 → 0 −T, D seconds, linear, infinite
```

Non-negotiable:

- `T = 1.6 ×` the rendered block height. A tile smaller than the block reads as
  a striped rainbow — the easiest mistake when scaling 7 px → 46 px.
- `D = T / 10`, never below 3 s. If the formula gives under 3 s the element is
  too small to carry the Mix: leave it flat.
- One keyframe per distinct T (30, 32, 36, 42, 45, 48, 58, 72), each translating
  exactly `−T`. `−42px` over a 45px tile jumps 3 px per cycle.
- Skew lives on the **container**, never the fill layer (two transform
  animations on one element silently drop one). FILL is in flow, ghosts absolute.
- The three cycles (3.0 / 2.1 / 3.4 s) are coprime: the exact pattern never
  repeats, yet no layer moves fast.
- **One hero per screen** carries skew. Zero or two is a bug.

Where it applies: data numbers, wordmarks and marks, 2 px borders/frames.
Where it does not: button fills, prose of any length, form labels, help text,
large background areas.

### Variant: frame

Borders, notification frames, primary CTAs — FILL only, on a 2 px-padded
container with a solid child inside. `T = 58 / D = 5.8s` is canonical for frames
regardless of size (frames are not text). At most one drifting frame per
viewport. Implemented in `tokens.css` as `.pp-frame`.

### Variant: shared field

Groups aligned to an edge (bar charts, segmented controls, tiled cards) share
one gradient, one `background-size`, one animation; only the delay differs:

```
delay_i = −(((H − h_i) mod T) ÷ T) × D      # H = container height, h_i = item height
```

The gradient crosses the group as one sheet. Give each item its own gradient and
colour starts encoding height, which height already encodes.

### Variant: static frame

Where animation is impossible (widgets, complications, print, email, still
export) render **one frame** of the gradient with cyan over the glyph. Never a
flat colour — the cut-out-of-a-field quality is the still-frame signature.

### The kill switch

Off, never dimmed. True when any of: always-on screen · reduced motion · low
power · the surface cannot animate. Result: no gradient, no ghosts, no skew,
nothing running; every mixed value becomes flat `--accent` (cyan); background
texture off. Dimming to ~42% would drop magenta under the contrast floor — the
number would vanish and reappear on its own, and still burn battery.

## 3. Color Palette & Roles

Semantic tokens (see `tokens.css` for the exact values):

| token | value | role |
|---|---|---|
| `--bg` | void `#05000E` | background of every surface (rare) |
| `--surface` | panel `#0B0018` | card fill, inside of a frame |
| `--border` | `#2A1F44` | 1 px chrome border, dividers |
| `--border-soft` | `#3A2C5E` | muted/disabled border |
| `--accent` | cyan `#7FF9FF` | primary accent, normal/live, flat state of all mixed data |
| `--danger` | magenta `#FF2D6F` | urgent, hard shadow colour, ghost A |
| `--warn` | yellow `#FFE600` | attention, section headers, active segment, low balance |
| `--pp-violet` | `#A56BFF` | scheduled (daily summary, regular alerts) |
| `--success` | green `#37F5A0` | positive states |
| `--fg` / `--muted` / `--meta` | `#E7E2F5` / `#8E86A8` / `#5E5580` | text ramp; `--meta` is uppercase micro-labels ONLY, never prose |
| `--pp-ultra-action` | `#FF7A1A` | strong action calls (watch side button) |

The gradient is **one continuous sheet**, declared once as `--pp-gradient`
(first and last stop identical → seamless tile). Never change the stop
percentages — they are spaced so no adjacent pair has a larger luminance jump.

Rules: `cyan` normal/live · `yellow` attention · `magenta` urgent · `violet`
scheduled. `green` and `orange` are gradient stops and are not semantic on their
own. **When the data itself is the alarm its colour is fixed and does not
drift** — a low-balance number goes flat `--warn`, not gradient.

## 4. Typography Rules

| Role | Face | Size | Notes |
|---|---|---|---|
| Hero number | Silkscreen 700 | 46–220 px | the one element that may carry skew |
| Display / heading | Silkscreen 700 | 20–46 px | caps, `--tracking-display` .06em |
| Label / micro-label | Silkscreen 700 | 11–14 px | caps, .08–.1em; section headers in `--warn` |
| Prose | IBM Plex Mono 400 | 15–17 px | line-height 1.6–1.7, `--fg` |
| Secondary prose | IBM Plex Mono 400 | 14–15 px | `--muted` |
| Data in tables | Silkscreen 700 | 14–18 px | tabular |

Both faces are OFL but licensed separately — bundle them; there is no system
equivalent. **Silkscreen never sets a sentence at any size** (its x-height kills
a paragraph). `--meta` is micro-labels only, it sits at 3.0:1.

## 5. Component Stylings

Sizes at open density; at compact/micro scale type down and keep every other
rule intact. All components exist as live fixtures in `components.html`.

- **Primary button** — 2 px gradient frame (`.pp-frame`), solid `--surface`
  interior, label `#fff`, hard shadow `--elev-raised`, caps Silkscreen,
  padding 9–14 vertical. Press: shadow drops to 0 and the button translates
  (looks pushed in). Never a gradient fill, never a radius.
- **Secondary button** — 2 px `--accent` stroke at 40–45% opacity, transparent
  fill. **Loud button** — solid `--warn` or `--accent` fill with `--bg` label,
  at most one per surface. **Disabled** — 1 px `--border-soft`, `--meta` label.
- **Inputs** — `--surface` fill, 1 px `--border`, padding 7–12, prose face,
  caps micro-label above. Focus: border → 2 px `--accent`, no glow, ≤120 ms.
  Error: 2 px `--danger` + a `--danger` prose line beneath.
- **Toggle** — 30×14 track + 12×12 square knob, radius 0. On = `--accent` track
  with `--bg` knob.
- **Segmented control** — equal items, 1 px `--border`, `--meta` labels; the
  active item is solid `--warn` with `--bg` label. May be a shared field.
- **Cards** — chrome: `--surface` + 1 px `--border`. Hierarchy: 2 px coloured
  border + hard shadow of the same colour at 25–30%. Featured: the frame variant
  (drifting border), one per viewport.
- **Table** — 1 px `--border` row rules, caps micro-label header, data in
  Silkscreen, prose in Plex Mono. No zebra. Hover: `--surface`.
- **Status dot** — 8×8 **square**, semantic colour, `steps(2)` blink over 1.4 s
  when "live". Never a circle, never a fade.
- **Navigation** — caps labels, 1 px `--border` divider, active item has a 2 px
  `--accent` edge on the leading side — not a fill, not a pill. Back links
  `< LABEL` in `--accent`.
- **Hero metric** — the full Mix plus skew, caps label beside/above, flat prose
  context beneath. One per surface.
- **Bar chart / sparkline** — shared field always. Bars 4–14 px (compact) /
  12–28 px (open); `min-height` 2–3 px. No data: flat
  `color-mix(in oklab, #ffffff 18%, transparent)`, no gradient, no animation.
  Axis labels at the extremes only — **no gridlines, ever**.

## 6. Layout & Spacing

Page rhythm comes from the 4-based scale only: `4 6 7 8 9 10 11 12 14 16 18 20
22 24 26` (multiples of 4 above that at open density). The shared schema exposes
the core steps (`--space-1…12`); the mid steps are derivation, not exceptions.

Web: 1200 px working width (`--container-max`), 64 px gutters, sections
separated by 1 px `--border` rules — never by alternating background panels.
Cards are separated by a 1 px `--border` line, never by a shadow, never by a
radius. Background texture (plasma radials under a 4 px dither —
`--pp-plasma`, `--pp-dither`) is optional and never sits under small text.

## 7. Depth & Elevation

Only two depths exist:

- **Flat** — `--elev-flat` (`none`).
- **Raised** — `--elev-raised`: `4px 4px 0 <solid colour>`, **zero blur, no
  diffusion**. Always magenta on cyan, or magenta on white. The same 4 px that
  the press state consumes, so a pressed button reads as flush with the surface.

There is no soft shadow anywhere in the system. `--elev-ring` exists as the
1 px chrome border expressed as a ring for focus/edge reuse. Focus is
`--focus-ring`: 2 px solid `--accent`, no glow.

## 8. Motion & Reduced Motion

The whole system, nothing beyond it:

| What | Duration | Curve |
|---|---|---|
| Gradient drift | T / 10 s | linear |
| Ghost cross | 2.1 s | ease-in-out |
| Hero skew | 3.4 s | ease-in-out |
| Live dot | 1.4 s | steps(2) |
| State change (focus, hover, press) | ≤ 120 ms | linear |
| Screen transition | 280 ms | snappy / ease-out |

No parallax, no scroll-driven animation, no entrance animation, no easing with
overshoot. Anything not listed needs a written reason next to it.

Reduced motion is the kill switch, shipped in the same stylesheet: flat cyan,
zero animations, texture off — **not dimmed** (see §2).

## 9. Densities

The tile ratio (1.6×) and speed (10 px/s) never change; the surface decides how
much qualifies.

| Density | Surfaces | Prose | Mixed elements |
|---|---|---|---|
| Micro | menu bar, complication, widget | 10–11 px | 1–2 |
| Compact | popover, phone screen, notification | 10–13 px | 2–4 |
| Open | web page, dashboard, slide, poster | 15–19 px | 1–3 |

The counter-intuitive row is open: a large surface is mostly prose, so
proportionally **less** qualifies, not more. One gradient headline per page, one
drifting frame per viewport. Filling a big canvas with the effect is the main
way this identity gets ruined.

## 10. Do's and Don'ts

**Do**

- Give every screen exactly one skewed hero; keep everything else still.
- Use `--accent` for primary actions, links, focus, live states — and for the
  flat form of every mixed value under the kill switch.
- Guarantee 4.5:1 contrast on every `--meta`/prose pairing it decorates
  (`--meta` is micro-labels only). Inverse selection: `::selection` must be
  `--accent` on `--bg`, never browser blue.
- Provide `:focus-visible` as 2 px solid `--accent`, no glow, no ring blur.
- Resolve every value through `var(--*)` from the `:root` block — never raw hex
  inside component CSS.
- Keep prose in IBM Plex Mono ≥ 15 px, line-height ≥ 1.6, never in Silkscreen.

**Don't**

- Don't make the gradient a background — full-bleed gradient panels turn a
  signal into wallpaper. It belongs inside glyphs and 2 px borders.
- Don't animate cards, borders, or more than one heading. Zero or two
  skews is a bug.
- Don't shrink the tile below the block — a too-small tile reads as a striped
  rainbow.
- Don't put a gradient fill inside a button — the label loses contrast every
  time magenta passes, and a button cannot have unreadable moments.
- Don't round anything. Radius 0. No pills, no circles (status dots included).
- Don't fade or dim the kill state — off, flat cyan, done.
- Don't add hues to the palette. New colour appears when a rule needs one, not
  when a screen feels flat.
- Don't use the gradient as section background, hero backdrop, full-width
  divider, or hover state — those four are how this identity becomes a 2013
  startup page.

## 11. Acceptance Checks

1. Every mixed element: `T = round(size × 1.6)` and `D = T / 10`; no `D < 3.0`.
2. One keyframe per distinct T in use (30, 32, 36, 42, 45, 48, 58, 72), each
   translating exactly `−T`.
3. Exactly one skewed element per screen (zero on watch face / always-on).
4. Every mixed element has exactly 3 layers: 2 ghosts + 1 fill, none of
   size 0.
5. Within a bar group: same gradient, same `background-size`, distinct delays
   (equal heights may share).
6. No gradient as a button fill; frames carry it on a 2 px border with a solid
   interior.
7. No IBM Plex Mono text carries the Mix.
8. Kill switch on ⇒ zero animations, zero gradients, all data flat `--accent`.
9. No `border-radius` other than 0 (the macOS popover's 12 px and watch
   hardware are the only exceptions in the entire system).
10. The data-that-is-the-alarm is flat in its semantic colour (e.g. low balance
    = flat `--warn`), never gradient.
11. Every still surface (widget, complication, print, email) renders one
    gradient frame with cyan over the glyph — not flat, not an animation that
    never runs.
12. Every stale-able value shows its timestamp.