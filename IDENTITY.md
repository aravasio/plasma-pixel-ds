# Plasma Pixel — the identity

An identity built on one idea: **colour that moves through a shape instead of
sitting on it.** Everything else — the black, the pixel type, the zero radius, the
hard offset shadows — exists to give that one moving thing a still surface to move
against.

It comes from the demoscene: the plasma effect, the scrolling copper bar, the
chromatic fringe of a mistuned signal. Those were not decorations, they were proof
that something was running. Plasma Pixel keeps that meaning — the motion says the
data is live — which is why it is spent only on data and marks, never on decoration.

---

## Five principles

**1. One mechanism, not a style kit.**
The Mix (`core/MIX.md`) is the identity. Three layers — a drifting gradient
clipped to the glyph, two chromatic ghosts, one skew — applied together or not at
all. If you are choosing between effects, you have already left the system.

**2. Motion reads because most things are still.**
Exactly one element per surface carries the skew. If everything vibrates, nothing
does. This is a counting rule, not a taste call: zero or two is a bug.

**3. Colour is a field, not a label.**
The gradient is one continuous sheet that objects are cut out of. Groups aligned to
a shared edge — bars, segments, tiles — share one coordinate system with a per-item
delay, so the colour crosses the group. Give each item its own gradient and colour
starts encoding size, which size already encodes.

**4. Hard edges everywhere.**
Radius 0. Shadows with zero blur, solid colour, 3–4px offset. Borders of 1px chrome
or 2px hierarchy. No soft anything. The only curve in the system belongs to the
hardware the design runs on.

**5. Never at the cost of legibility.**
The gradient never fills a button — the label would go unreadable each time magenta
passes. It never touches prose. And it turns off completely — flat cyan, no
animation — for reduce-motion, low power, or an always-on screen. Off, not dimmed:
dimmed drops magenta under the contrast floor, so the value vanishes and reappears
by itself, and it still burns battery.

---

## Recognisable at a glance

Someone should be able to identify a Plasma Pixel surface from a still frame, with
no motion at all. The still-frame tells:

- Near-black background, one flat panel tone above it.
- Pixel type in caps for every number and label; a mono for anything read as a
  sentence.
- One number rendered in gradient, everything around it in flat cyan or grey.
- A magenta shadow offset down-right with no blur, on a cyan or white shape.
- Not one rounded corner.

If a frame passes those five, the motion is a bonus, not the point.

---

## One identity, three densities

The scale rules never change — tile = 1.6× the block, 10 px/s — but the surface
decides how much qualifies.

| Density | Surfaces | Prose | Mixed elements |
|---|---|---|---|
| **Micro** | menu bar, complication, widget | 10–11px | 1–2 |
| **Compact** | popover, phone screen, notification | 10–13px | 2–4 |
| **Open** | web page, dashboard, slide, poster | 15–19px | 1–3 |

The counter-intuitive row is the last one. A large surface is mostly prose, so
proportionally **less** of it qualifies for the Mix, not more. A landing page gets
one gradient headline number and a gradient rule; a dashboard gets its primary
metric and nothing else. The instinct to fill a big canvas with the effect is the
main way this identity gets ruined.

---

## Where it belongs

Good fits: developer tools, monitors and dashboards, anything with a live number at
its centre, technical documentation, event and release material, terminal-adjacent
products, music and demoscene culture.

Bad fits — say no rather than adapt: long-form reading (a magazine, a blog), any
product where the pixel type would exclude readers who need a variable-weight face,
light-first brands (the system inverts poorly — the light palette exists for a menu
bar on a bright wallpaper, not for a white page), and children's or medical
contexts where chromatic fringing on numerals is a hazard rather than a texture.

---

## Ways this dies

- **The gradient becomes a background.** Full-bleed gradient panels turn a signal
  into wallpaper. It belongs inside glyphs and inside 2px borders.
- **Everything animates.** Cards drifting, borders pulsing, three skewed headings.
- **The tile shrinks.** A tile smaller than the text block reads as a striped
  rainbow — the effect stops being copper and starts being a novelty font.
- **Pixel type used for prose.** Silkscreen's x-height makes a paragraph unreadable
  at any size.
- **A second accent family is added.** The palette is six gradient stops plus four
  semantic colours. New hues get added when a rule needs a colour, not when a
  screen feels flat.

---

## Files

| Path | What it is |
|---|---|
| `core/DESIGN.md` | Tokens, rationale, component guidance — self-contained, paste into a design-to-code tool. |
| `core/MIX.md` | The mechanism in full, with ports for CSS, SwiftUI, canvas, and static output. |
| `core/COMPONENTS.md` | Platform-agnostic component recipes. |
| `core/platforms/` | macOS, iOS, watchOS, web: what each platform forbids and forces, and where it overrides the identity. |
| `core/tokens/` | `tokens.json` is the source of truth; the CSS and Swift files are generated from it. |
| `core/examples/` | A live sheet showing the identity at open density, away from any product. |
| `apps/saldobar/` | The first application: a macOS menu-bar app and its Apple Watch alerts. Full spec, handoff, and prototypes. |
