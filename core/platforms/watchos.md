# watchOS

The most constrained surface, and the one where the identity happens to look best —
small pixel type on a black OLED is what the aesthetic was made for. Almost
everything here is a limit rather than an opportunity.

## What the platform forbids

- **No third-party watch faces.** What ships is a *complication* inside somebody
  else's face. Any full-face design is context, not a deliverable.
- **Complications and Smart Stack widgets do not animate.** Static-frame variant,
  always.
- **Styled notifications require your own watchOS app.** Delivered through a
  forwarding service alone, you get plain system text and nothing else. Decide this
  before estimating anything: it is the difference between a stylesheet and two new
  app targets.
- **No custom fonts in some complication families** and severe truncation in all of
  them. Verify per family rather than trusting a mock.

## What the platform forces

- **Always-on display is the kill switch, mandatory.** Not dimmed — off. Flat cyan,
  no gradient, no ghosts, no skew, no texture, screen at ~50%.
- **Refresh budget.** Complication data will be stale. Always show the timestamp of
  the value, or the number becomes a confident lie.
- **Sizes.** Design to the 49 mm Ultra (410 × 502) and verify at 41 mm (352 × 430).
  The identity's floor is 8.5 pt for display type on watch — below that the pixel
  grid and the screen's subpixels interfere.
- **Tap targets stay 44 pt** even at these screen sizes. Two full-width buttons
  stacked, never three across.
- **Corner-to-corner is a curve you do not control.** Keep 14–20 pt of side padding
  so a square frame never fights the bezel radius.

## The Mix here

Micro density. One mixed element per surface, maximum two.

| Surface | Hero | Mix |
|---|---|---|
| Notification banner (short look) | the metric | full three layers |
| Long look | the metric | full three layers |
| Complication | the metric | **static frame** — one gradient frame, cyan over the glyph |
| Smart Stack widget | the metric | **static frame** |
| Always-on | none | off entirely |

The complication takes no skew even when it is the only mixed element on screen:
the face's hero is the clock, and it is not yours.

## Checks

1. Always-on: zero running animations, all data flat cyan.
2. Complication and widget render one gradient frame with cyan over the glyph — not
   flat, not an animation that never starts.
3. Every value is accompanied by its timestamp.
4. Legible at 41 mm, not only at 49 mm.
5. No display type below 8.5 pt.
6. Buttons full width, stacked, ≥ 44 pt.
