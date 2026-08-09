# DESIGN.md — SaldoBar · Plasma Pixel

A demoscene-derived system for a macOS menu-bar app (SaldoBar, OpenRouter balance monitor) and its Apple Watch alert surfaces. Dark, zero-radius, pixel-type, with one animated mechanism — **the Mix** — applied to data and marks only.

---

## 1. Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| `void` | `#05000E` | background of every surface |
| `panel` | `#0B0018` | card fill / inside of a frame |
| `border` | `#2A1F44` | 1px chrome border, dividers |
| `borderSoft` | `#3A2C5E` | muted / disabled border |
| `cyan` | `#7FF9FF` | primary accent, normal state, ghost A |
| `magenta` | `#FF2D6F` | urgent, hard offset shadow, ghost B |
| `yellow` | `#FFE600` | attention, section headers, active segment |
| `violet` | `#A56BFF` | scheduled |
| `green` | `#37F5A0` | gradient stop |
| `orange` | `#FF8A00` | gradient stop |
| `textPrimary` | `#E7E2F5` | reading text |
| `textSecondary` | `#8E86A8` | secondary (5.9:1 on void) |
| `textTertiary` | `#5E5580` | uppercase micro-labels ONLY, never prose |
| `ultraAction` | `#FF7A1A` | watch side button, face date |

Light-menu-bar variant (same structure, lower luminance): `#C4004F · #A34A00 · #7A6A00 · #0A7A4E · #0090A8 · #5B2BC4`.

### The gradient (single definition, reused everywhere)
```css
linear-gradient(180deg,
  #FF2D6F 0%, #FF8A00 17%, #FFE600 34%, #37F5A0 50%,
  #7FF9FF 67%, #A56BFF 84%, #FF2D6F 100%)
```
First and last stop are identical so the tile is seamless when repeated. Do not change the percentages — they are spaced so no adjacent pair has a larger luminance jump than the rest.

### Type
| Family | Weight | Use | Floor |
|---|---|---|---|
| Silkscreen | 700 | numbers, labels, titles, wordmark | 8px macOS · 8.5px watch |
| Silkscreen | 400 | menu-bar idle state | 6.5px |
| IBM Plex Mono | 400/600 | prose, help, descriptions | 10px |

Both OFL; bundle the `.ttf`s — no system equivalent. Silkscreen never for prose.
Sizes in use: 7 · 7.5 · 8 · 8.5 · 9 · 9.5 · 10 · 10.5 · 11 · 20 · 22 · 26 · 28 · 30 · 34 · 36 · 46 · 52.

### Shape, depth, texture
```
radius        0 everywhere. Only exceptions: popover (12, macOS chrome) and watch hardware.
hard shadow   3–4px X and Y · solid color · blur 0 · no diffusion
              always magenta on cyan, or magenta on white
borders       1px #2A1F44 chrome · 2px color (or 2px drifting gradient) for hierarchy
spacing       4-scale: 4 6 7 8 9 10 11 12 14 16 18 20 22 24 26
dither        repeating-conic-gradient(rgba(0,0,0,.60) 0% 25%, transparent 0% 50%), 4px tile
              sits ON the plasma, never over small text, fully off in always-on
plasma        3 radials (cyan/magenta/violet) on inset -25%, blur(7px), drifting 9s ease-in-out
```

---

## 2. The Mix — the one mechanism

Three stacked layers, each attacking a different property so they never compete. Applied **all together or not at all**.

```
mix(text, size):
  T = round(size × 1.6)          # tile height
  D = T / 10                     # seconds — gradient always travels 10 px/s
  g = max(1, round(size / 16))   # ghost offset

  container: position relative; width fit-content
    if isScreenHero: skewX 0° → −2.5° → 0°, 3.4s ease-in-out infinite (+0.5px translateX)

    GHOST_A  (absolute, inset 0): text, #FF2D6F, opacity .75
             translateX +g → −g → +g, 2.1s ease-in-out infinite
    GHOST_B  (absolute, inset 0): identical, #7FF9FF, animation-delay −1.05s
    FILL     (in flow — defines container size): text, background = THE GRADIENT,
             background-size 100% T, background-clip: text, color transparent,
             background-position 0 0 → 0 −T, D seconds, linear, infinite
```

**Non-negotiable rules**
- `T = 1.6 × block height`. A tile smaller than the block reads as a rainbow again — the easiest mistake when scaling 7px → 46px.
- `D = T / 10`, never below 3.0s. Faster reads as flicker and the menu bar stops being a place you can work.
- Each distinct `T` needs its own keyframe that translates exactly `−T`. `−42px` over a 45px tile jumps 3px per cycle.
- Skew lives on the **container**, never on the fill layer — two transform animations on one element silently drop one.
- FILL must be in flow, ghosts absolute; otherwise the container collapses.
- The three cycles (3.0 / 2.1 / 3.4s) are coprime: the exact pattern never repeats, yet no layer moves fast.

**One hero per screen** carries skew. Zero or two is a bug. Motion reads because something next to it is still.

### Where it applies
Data numbers (balance, spend), the wordmark, and **borders/frames** (2px gradient frame with solid interior).

### Where it does not
- **Button fills.** Text loses contrast every time magenta passes; a button can't have unreadable moments. Gradient goes on the 2px border, fill stays solid.
- **Reading text.** Sentences, form labels, help, rule descriptions: always flat `#E7E2F5` / `#8E86A8`.

### Frame variant
`padding: 2px` + gradient background at `background-size: 100% 58` / `5.8s`, solid child inside, plus a hard offset shadow. `T=58` is canonical for frames regardless of frame size — frames aren't text, so 1.6× doesn't apply.

### Shared-field variant (bar groups, segments)
Every element gets the same gradient and the same `background-size`; only the delay differs:
```
delay_i = −(((H − h_i) mod T) ÷ T) × D      # H = container height
```
The gradient crosses the group as one sheet. Give each bar its own gradient instead and short bars all go magenta, tall bars all violet — color starts encoding height, which height already encodes.

### The kill switch
One derived boolean, true if **any** of: watch always-on · `accessibilityReduceMotion` · low power.
When true: every layer off — no gradient, no ghosts, no skew, no running animation; all mixed data becomes flat `#7FF9FF`; dither and plasma off too.
Do **not** implement it as "dim the mix": dimming to 42% drops magenta under the contrast floor, so the number vanishes and reappears on its own — and still burns battery.

---

## 3. Component guidance

**Menu-bar label (26pt).** Two lines, `fixedSize`. Idle: `you've got / no mail`, Silkscreen 400 6.5px, `#E7E2F5@40`. With news: `YOU'VE GOT / NEWS`, Silkscreen 700 7px, line-height 9, full mix (T=30 / 3.0s / ghost 1px / skew). The string is ten characters including the space. Must work on light and dark menu bars.

**Popover (340pt).** `void` fill, 1px `#2A1F44` border, radius 12. Home has exactly one widget row — no placeholder platforms. Detail order: back link → balance header (plasma + dither, hero `12.08` at 36px, no `$` — inherited from the existing formatter, intentional) → two 50% actions → CONSUMO → NOTICIAS → CONEXIÓN → RELOJ · NTFY. Section boxes: 1px border, 12 padding, yellow uppercase header at 8.5px `letter-spacing .1em`.

**Bar charts.** 14 days, scale max 4.2, `height = max(2, round(v / 4.2 × H))`, shared field. Days with no data: flat `rgba(255,255,255,.18)`, no gradient, no animation.

**Buttons.** Primary = 2px gradient frame + solid interior + magenta hard shadow. Secondary = 2px `#7FF9FF@40-45` stroke. Silkscreen 9–10px, vertical padding 9.

**Watch surfaces** (Ultra 2, mockup 274×334 → ×1.496 for real px). Banner hero 46px (T=72), long look 34px (T=58), Smart Stack 30px (T=48), complication 22px (T=36, no skew — the face's hero is the clock). Always-on: mix off, 50% global opacity, black background.

**Alert-rule color** goes on the frame, the pulsing dot and the title — never on the number, with one exception: low balance, where the number is flat `#FFE600`. When the data *is* the alarm, the color is fixed and must not drift.
`wholeDollar` cyan · `lowBalance` yellow · `spike` magenta · `dailySummary` violet.

**Icons.** No asset files; built from rectangles and borders. Substitute SF Symbols where an equivalent exists, keeping the specified size and color. The OpenRouter tile (cyan square, three dark bars) is brand — build it from shapes.

---

## 4. Acceptance checks

1. Every filled element: `T == round(size × 1.6)` and `D == T / 10`; no `D < 3.0`.
2. One keyframe per distinct `T` in use (30, 32, 36, 42, 45, 48, 58, 72), each translating exactly `−T`.
3. Exactly one skewed element per screen — zero on the watch face, always-on, and the rule grid.
4. Every mixed element has exactly 3 layers, none of size 0.
5. Within a bar group: same gradient, same `background-size`, distinct delays.
6. No gradient as a button fill; frames carry it on a 2px border with a solid interior.
7. No IBM Plex Mono text carries the mix.
8. Kill switch on ⇒ zero animations, zero gradients, all data flat `#7FF9FF`.
9. No `border-radius` other than 0, except the popover (12) and watch hardware.
