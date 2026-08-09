# Plasma Pixel — full design system, self-contained prompt

> You are implementing **Plasma Pixel**, a design identity and design system. You
> cannot open the repository: everything you need is in this file. Follow it
> exactly — exact hex values, exact arithmetic, exact rules. Where this file is
> silent, prefer the nearest token over a new value.
>
> Core idea, defend it in every decision: **colour that moves through a shape
> instead of sitting on it.** The Mix (below) is the identity. Everything else —
> near-black surfaces, pixel type, zero radius, hard offset shadows — exists to
> give one moving thing a still surface to move against. Motion means the data is
> live; it is spent on data and marks only, never on decoration.

---

## 1. The five principles

1. **One mechanism, not a style kit.** The Mix is the identity: three layers
   applied together or not at all. Choosing between effects = leaving the system.
2. **Motion reads because most things are still.** Exactly **one element per
   surface** carries the skew. Zero or two is a bug.
3. **Colour is a field, not a label.** The gradient is one continuous sheet that
   objects are cut out of. Groups aligned to an edge share one coordinate system
   with per-item delays (shared-field variant) so colour crosses the group.
4. **Hard edges everywhere.** Radius 0. Shadows with zero blur, solid colour,
   3–4 px offset. 1 px chrome borders, 2 px hierarchy borders.
5. **Never at the cost of legibility.** The gradient never fills a button, never
   touches prose, and turns off **completely** (not dimmed) for the kill switch.

## 2. Tokens

### Colors (`#hex`, exact)

| Token | Hex | Use |
|---|---|---|
| `void` | `#05000E` | background of every surface |
| `panel` | `#0B0018` | card fill, inside of a frame |
| `border` | `#2A1F44` | 1 px chrome border, dividers |
| `borderSoft` | `#3A2C5E` | muted / disabled border |
| `cyan` | `#7FF9FF` | primary accent, normal/live state, flat state of all mixed data |
| `magenta` | `#FF2D6F` | urgent, hard offset shadow colour, first ghost |
| `yellow` | `#FFE600` | attention, section headers, active segment |
| `violet` | `#A56BFF` | scheduled |
| `green` | `#37F5A0` | gradient stop only — not semantic on its own |
| `orange` | `#FF8A00` | gradient stop only — not semantic on its own |
| `textPrimary` | `#E7E2F5` | reading text |
| `textSecondary` | `#8E86A8` | secondary text (5.9:1 on void) |
| `textTertiary` | `#5E5580` | uppercase micro-labels ONLY, never prose (3.0:1) |
| `ultraAction` | `#FF7A1A` | strong action calls (watch side button, face date) |

Light menu-bar variant (macOS light appearance; same structure, lower luminance —
never invert the identity): `#C4004F · #A34A00 · #7A6A00 · #0A7A4E · #0090A8 · #5B2BC4`.

### The gradient (single definition, reused everywhere; do not change stop percentages)

```
linear-gradient(180deg, #FF2D6F 0%, #FF8A00 17%, #FFE600 34%, #37F5A0 50%, #7FF9FF 67%, #A56BFF 84%, #FF2D6F 100%)
```

First and last stop are identical so the tile repeats seamlessly. The percentages
are spaced so no adjacent pair has a larger luminance jump than the rest; moving
one creates a dark seam in the cycle.

### Type

| Role | Face / weight | Hard floor | Notes |
|---|---|---|---|
| Hero number | Silkscreen 700 | 8 pt macOS · 8.5 pt watch | the one element that may carry skew; open density 64–220 px |
| Display / heading | Silkscreen 700 | 8 pt | caps, `letter-spacing .06em`, open density 20–46 px |
| Label / micro-label | Silkscreen 700 | 8 pt | caps, `.08–.1em`; section headers in `yellow`; `textTertiary` for subdued ones |
| Prose | IBM Plex Mono 400 | 10 pt | `line-height 1.6–1.7`, `textPrimary`; open density 15–17 px |
| Secondary prose | IBM Plex Mono 400 | 10 pt | `textSecondary`, 14–15 px open |
| Data in tables | Silkscreen 700 | 8 pt | tabular by nature, 14–18 px open |

Both faces are OFL, both required, no system equivalent: **Silkscreen** (400/700)
and **IBM Plex Mono** (400/600). **Silkscreen never sets a sentence at any size** —
its x-height kills a paragraph. Size scale in use: `7 7.5 8 8.5 9 9.5 10 10.5 11
20 22 26 28 30 34 36 46 52`.

### Shape, depth, texture

```
radius        0 everywhere. Only exceptions: the macOS popover (12, system chrome)
              and watch hardware (bezel radius).
hard shadow   3–4 px X and Y · solid colour · blur 0 · no diffusion
              always magenta on cyan, or magenta on white
borders       1 px #2A1F44 chrome · 2 px colour (or 2 px drifting gradient) for hierarchy
spacing       4-based scale: 4 6 7 8 9 10 11 12 14 16 18 20 22 24 26
              (multiples of 4 above 26 at open density; web gutters 64 px, working width 1200 px)
dither        repeating-conic-gradient(rgba(0,0,0,.60) 0% 25%, transparent 0% 50%), 4 px tile
              sits ON the plasma, never over small text, fully off in always-on / print / email
plasma        3 radials (cyan/magenta/violet) inset -25%, blur(7px), drifting 9s ease-in-out
```

## 3. Densities — one identity, one tile rule, three surfaces

Tile ratio (1.6×) and speed (10 px/s) never change. What changes is **how much of
the surface qualifies for the Mix**.

| Density | Surfaces | Prose | Mixed elements / screen |
|---|---|---|---|
| **Micro** | menu bar, complication, widget | 10–11 px | 1–2 |
| **Compact** | popover, phone screen, notification | 10–13 px | 2–4 |
| **Open** | web page, dashboard, slide, poster | 15–19 px | 1–3 |

Counter-intuitive row: open. A large surface is mostly prose, so proportionally
**less** qualifies, not more. One gradient headline per page, one drifting frame
per viewport. The instinct to fill a big canvas is the main way this identity
gets ruined.

## 4. The Mix — the one mechanism

Three stacked layers, each attacking a different property so they never compete.
**All together or not at all.**

```
mix(text, size, isHero):
    T = round(size × 1.6)          # tile height
    D = T / 10                     # seconds — the gradient always travels 10 px/s
    g = max(1, round(size / 16))   # ghost offset

    container: position relative, width fit-content
        if isHero: skewX 0° → −2.5° → 0°, 3.4s ease-in-out infinite
                   (with translateX 0 → 0.5px → 0 riding along)

        GHOST_A  absolute, inset 0 — the same text, magenta, opacity .75
                 translateX +g → −g → +g, 2.1s ease-in-out infinite
        GHOST_B  identical, cyan, animation-delay −1.05s (half phase)
        FILL     in flow — defines the container size
                 the gradient, background-size 100% T, clipped to the text,
                 background-position 0 0 → 0 −T, D seconds, linear, infinite
```

The three cycles — 3.0 / 2.1 / 3.4 s — are coprime: the exact combined pattern
never repeats, yet no single layer moves fast.

### Non-negotiable rules

- `T = 1.6 × rendered block height` (one line ≈ font size at `line-height: 1`; a
  two-line block = whole block). A tile smaller than the block reads as a striped
  rainbow — the easiest mistake scaling 7 px → 46 px.
- `D = T / 10`, never below **3.0 s**. If the formula lands under 3 s the element
  is too small to carry the Mix: leave it flat.
- One keyframe per **distinct T**, translating exactly `−T`. `−42 px` over a
  45 px tile jumps 3 px per cycle. Tiles in use: `30 32 36 42 45 48 58 72`.
- Skew lives on the **container**, never on the fill layer — two transform
  animations on one element silently drop one.
- FILL **in flow**, ghosts absolute; otherwise the container collapses.
- `width: fit-content` always, or the ghosts stretch and the chromatic fringe
  detaches from the glyphs.
- Exactly **one hero per screen** carries skew (zero on watch face, always-on,
  and the rule grid).

### Where it applies

Data numbers (balance, spend), wordmarks and marks, and 2 px borders/frames.

### Where it does not

Button fills (label loses contrast every time magenta passes), prose of any
length, form labels and help text, large background areas, more than one skewed
element per screen.

### Variant: frame (borders, notification frames, primary CTAs)

FILL only, on the background of a 2 px-padded container with a solid child inside:

```
frame: padding 2px
       background = the gradient, background-size 100% 58, 5.8s linear infinite
       box-shadow 4px 4px 0 <solid colour>   # no blur
  child: solid background, the real content
```

`T = 58 / D = 5.8 s` is canonical for frames regardless of size — frames are not
text, so the 1.6× rule does not apply. At most one drifting frame per viewport.

### Variant: shared field (bar groups, segments, tiled cards)

Same gradient, same `background-size`, same animation for every item; only the
delay differs:

```
delay_i = −(((H − h_i) mod T) ÷ T) × D      # H = container height, h_i = item height
```

The gradient then crosses the group as one sheet. Give each item its own gradient
and colour starts encoding height, which height already encodes. Equal-height
items may share an equal delay.

### Variant: static frame (no animation possible: widgets, complications, print, email, still export)

Render **one frame** of the gradient and pick the offset that puts **cyan over
the glyph**. Never substitute a flat colour — the cut-out-of-a-field quality is
what makes a still frame recognisable.

### The kill switch

One derived boolean, true if **any** of: always-on screen (watch) ·
`prefers-reduced-motion` / Reduce Motion · low power · Reduce Transparency
(additionally kills plasma and dither) · the surface cannot animate.

When true, **everything off**: no gradient, no ghosts, no skew, no running
animation; every mixed value becomes flat `cyan` `#7FF9FF`; dither and plasma off
too. **Never implement it as "dim the Mix"** — dimming the layers to ~42% drops
magenta below the contrast floor (the number vanishes and reappears on its own)
and still burns battery.

## 5. Components

Sizes below are at **open density**; scale type down per the density table and
keep every other rule intact.

- **Surface:** `void` background. Panels/cards `panel`, separated by a 1 px
  `border` line — never by a shadow, never by a radius. Optional texture: plasma
  + dither (kill state: off; never under small text). Rhythm from the 4-spacing
  scale only.
- **Buttons:** Primary = 2 px **gradient frame** (frame variant), solid `void`
  interior, label `#fff`, hard shadow `4px 4px 0 magenta`, vertical padding 9–14.
  Secondary = 2 px `cyan` stroke at 40–45% opacity, transparent fill, label
  `textPrimary`. Loud = solid `yellow` or `cyan` fill, `void` label, hard shadow,
  at most one per surface. Disabled = 1 px `borderSoft`, label `textTertiary`, no
  shadow, no animation. Never a gradient fill, never a radius. Press state:
  shadow offset drops to 0 and the button translates by the same amount.
- **Frames/cards:** Chrome = `panel` fill + 1 px `border`. Hierarchy = 2 px
  coloured border + hard shadow of the same colour at 25–30%. Featured = the
  frame variant (drifting border), at most one per viewport.
- **Inputs:** fill `panel`, 1 px `border`, padding 7–12, prose face, label above
  as caps micro-label. Focus: border → 2 px `cyan` — no glow, no ring, transition
  ≤ 120 ms. Error: 2 px `magenta` + a magenta prose line beneath.
- **Toggle:** 30 × 14 rectangle, 12 × 12 square knob, both radius 0. On = `cyan`
  track, `void` knob.
- **Segmented control:** equal-width items, 1 px `border`, `textTertiary` labels;
  active item solid `yellow` fill with `void` label. Optionally a shared field
  across the row.
- **Hero metric:** the full Mix plus skew, caps label beside or above, flat prose
  line of context beneath. One per surface.
- **Bar chart:** shared field, always. Bars 4–14 px wide compact / 12–28 px open,
  `min-height` 2–3 px so an empty day still reads as a bar. No data: flat
  `rgba(255,255,255,.18)`, no gradient, no animation. Axis labels caps
  micro-labels at the extremes only — no gridlines, ever.
- **Sparkline:** same, no labels, height 22–40.
- **Table:** 1 px `border` row rules, caps micro-label header, data in Silkscreen,
  prose in Plex Mono. No zebra striping. Row hover: `panel` fill.
- **Status dot:** 8 × 8 **square** (never a circle) in the semantic colour,
  blinking `steps(2)` over 1.4 s when "live". Steps, never a fade.
- **Navigation:** caps labels, 1 px `border` dividers, active item marked by a
  2 px `cyan` edge on the leading side — not a fill, not a pill. Breadcrumbs /
  back as `< LABEL` in `cyan`.
- **Semantic colour:** `cyan` normal/live · `yellow` attention · `magenta` urgent
  · `violet` scheduled. `green`/`orange` are gradient stops, not semantic.
  **When the data itself is the alarm its colour is fixed and does not drift** —
  a low-balance number goes flat `yellow`, not gradient.
- **Icons:** no asset files; build from rectangles and borders. SF Symbols where
  an equivalent exists, keeping size and colour.

### Motion inventory — the whole system, nothing beyond it

| What | Duration | Curve |
|---|---|---|
| Gradient drift | T / 10 s | linear |
| Ghost cross | 2.1 s | ease-in-out |
| Hero skew | 3.4 s | ease-in-out |
| Live dot | 1.4 s | steps(2) |
| State change (focus, hover, press) | ≤ 120 ms | linear |
| Screen transition | 280 ms | snappy / ease-out |

No parallax, no scroll-driven animation, no entrance animation, no easing with
overshoot. Anything not on this list needs a written reason.

## 6. Platform constraints (what each forbids/forces)

- **macOS (home surface, most permissive):** you do not own the menu bar — the
  item sits at 26 pt on the user's wallpaper; nothing that reads as an error,
  badge or system alert. Opaque `void` popover background (no reliance on
  vibrancy). Light menu-bar appearance ⇢ the light palette; same structure, same
  tile, same speed. Increase Contrast ⇢ drop `textTertiary`, promote to
  `textSecondary`. Popover width is a commitment: 340 pt, no horizontal scroll,
  one width per app. Keyboard first; the focus ring is the system's — do not
  restyle it into a 2 px cyan border (it would be indistinguishable from the
  identity's input focus). Mix: micro in the menu bar, compact in the popover.
  **Pause the animation when nothing is live** — it is an invisible battery leak.
  Low Power Mode ⇢ kill switch.
- **iOS (hardest, one reason: Dynamic Type):** prose scales normally with
  `UIFontMetrics`, floor 10 pt, no cap. Display type scales in **integer
  multiples only** (1×, 2×, 3×) — a pixel face at 1.35× interpolates and reads as
  a rendering bug. Above `.accessibilityLarge`, display switches to IBM Plex Mono
  SemiBold and drops the Mix (legibility outranks identity there). Every tappable
  element ≥ 44 × 44 pt. Dark only — declare `UIUserInterfaceStyle = Dark`.
  Live Activities and widgets (WidgetKit) never animate ⇒ static-frame variant.
  Notifications from a third-party service render as system text. Tab/nav bars
  are system components: tint `cyan`, background `void`, don't rebuild for square
  corners. VoiceOver must read the metric as one value — mark the two ghosts
  hidden.
- **watchOS (most constrained, looks best):** no third-party faces — a
  complication lives inside somebody else's face; its hero is the clock and is
  not yours, so **complications and Smart Stack widgets take the static frame and
  never skew**. Always-on **is the kill switch, mandatory**: flat cyan, ~50%
  screen, no texture. Complications don't animate and may not take custom fonts —
  verify per family. Always show the value's timestamp (stale data is a confident
  lie). Design to 49 mm Ultra (410 × 502), verify at 41 mm (352 × 430); display
  floor 8.5 pt. Tap targets stay 44 pt: two full-width buttons stacked, never
  three across. Keep 14–20 pt side padding so square frames never fight the bezel
  radius. Styled notifications require your own watchOS app target.
- **Web (most capable, easiest to ruin — the constraint is editorial):**
  `prefers-reduced-motion` feeds the kill switch, shipped in the same stylesheet.
  `background-clip: text` needs `-webkit-` + `-webkit-text-fill-color:
  transparent`, with a flat-cyan fallback via `@supports not (background-clip:
  text)` — without it text is invisible, not degraded. Define `::selection`
  (cyan on void) and `a`/`a:hover` or you get browser blue. Print/email: static
  frame, no plasma, no dither. Both fonts via `font-display: swap` with
  `monospace` fallback; the swap is visible, accept it. One gradient text element
  per page, one drifting frame per viewport, charts as shared fields, everything
  else flat. Section separators are 1 px `border` rules, never alternating
  background panels. **Never** use the gradient as section background, hero
  backdrop, full-width divider, or hover state. Cost note: the drift animates
  `background-position` on a text-clipped element, which is not GPU-composited —
  if the page feels heavy you have too many mixed elements, which is already a
  design error.

## 7. Ports (express once, as a single reusable component/modifier with the kill switch inside)

- **CSS:** as written in §4; one `@keyframes` per distinct T.
- **SwiftUI:** `TimelineView(.animation)` + a `VStack` of repeated
  `LinearGradient`s of height T, offset by `-(t * 10).truncatingRemainder(dividingBy: T)`,
  inside `.mask(Text(...))`. `foregroundStyle(LinearGradient)` does not work (no
  tiling/scroll). Ghosts: `ZStack` of two flat `Text`s with animated `.offset(x:)`.
  Skew: `.transformEffect(CGAffineTransform(a: 1, b: 0, c: tan(angle), d: 1, tx: 0, ty: 0))` —
  `rotationEffect` cannot skew. Shared field: pass the computed delay as the
  **initial phase** of each `TimelineView`, not `.animation(.delay)`.
- **Canvas / WebGL:** draw the tiled gradient to an offscreen buffer of height T,
  `globalCompositeOperation = "source-in"` against the rasterised text; ghosts
  are two extra draws before it.
- **Android / Compose:** `Brush.linearGradient` with `TileMode.Repeated` on a
  `drawWithContent` + `BlendMode.SrcIn` layer; animate the brush's start offset.

Twelve copies of the same arithmetic is how a wrong T reaches production —
write it once.

## 8. Acceptance checks (run these at the end, on every deliverable)

1. Every mixed element: `T == round(size × 1.6)` and `D == T / 10`; no `D < 3.0`.
2. One keyframe per distinct T (30, 32, 36, 42, 45, 48, 58, 72), each translating
   exactly `−T`.
3. Per screen, skewed elements are exactly the scheduled heroes (e.g. menu bar 1,
   banner 1, long look 1, watch face 0, always-on 0, smart stack 1, popover 1);
   a skeleton is: watch face 0, always-on 0, rule grid 0, everything else at most 1.
4. Every mixed element has exactly 3 layers (2 ghosts + 1 fill); no layer of size 0.
5. Within a bar group: same gradient, same `background-size`, distinct delays
   (equal heights may share a delay).
6. No gradient as a button fill; frames carry it on a 2 px border with a solid interior.
7. No IBM Plex Mono text carries the Mix.
8. Kill switch on ⇒ zero animations, zero gradients, all data flat `#7FF9FF`.
9. No `border-radius` other than 0, except the popover (12) and watch hardware.
10. The alarm-that-is-data is flat in its semantic colour (e.g. low balance =
    flat `#FFE600`), never gradient.
11. Every static surface (widget, complication, print, email) renders one gradient
    frame with cyan over the glyph — not flat, not an animation that never runs.
12. Every value that can go stale shows its timestamp.
13. Platform checks: iOS ≥ .accessibilityXXXL readable with no interpolated pixel
    type; all targets ≥ 44 × 44 pt; watch legible at 41 mm; web text visible
    without `background-clip: text` support; `::selection`, `a`, `a:hover`
    defined; `prefers-reduced-motion: reduce` ⇒ flat cyan, zero animations.

## 9. This identity dies when

- The gradient becomes a **background** (full-bleed gradient panels turn a signal
  into wallpaper; it belongs inside glyphs and 2 px borders).
- Everything animates (cards drifting, borders pulsing, three skewed headings).
- The tile shrinks below the block (striped rainbow, novelty font).
- Silkscreen is used for prose.
- A second accent family is added — new hues appear when a rule needs a colour,
  not when a screen feels flat.

Where it belongs: developer tools, monitors/dashboards, anything with a live
number at its centre, technical docs, release material, terminal-adjacent
products, music/demoscene culture. Say no (rather than adapt) to long-form
reading, variable-weight readers, light-first branding on a white page, and
children's/medical contexts where chromatic fringing on numerals is a hazard.

---

*Plasma Pixel — core 1.1.0. This file is generated to be self-sufficient; if a
value here disagrees with something you know, this file is correct.*