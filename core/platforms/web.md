# Web

The most capable surface and the easiest to ruin, because there is room. Open
density: a large page is mostly prose, so proportionally **less** of it qualifies
for the Mix, not more.

## What the platform forbids

- Nothing technically — which is the problem. The constraint here is editorial.

## What the platform forces

- **`prefers-reduced-motion`** feeds the kill switch. Ship it in the same
  stylesheet as the animation, not as a later pass.
- **`background-clip: text`** needs `-webkit-` and `color: transparent`
  (`-webkit-text-fill-color` is the reliable one). Without it the text renders
  fully transparent — invisible, not degraded. Provide a flat-cyan fallback with
  `@supports not (background-clip: text)`.
- **Selection and links.** Define `::selection` (`cyan` on `void` inverted) and
  `a` / `a:hover` explicitly, or you get browser blue inside a near-black page.
- **Print and email** cannot animate: static-frame variant, and drop the plasma and
  dither entirely (they cost ink and render as mud).
- **Font loading.** Both faces are required; use `font-display: swap` with
  `monospace` fallback metrics, and accept that the swap is visible — a pixel face
  has no metric-compatible fallback.

## The Mix here

- **One** gradient headline or metric per page. Not per section — per page.
- A drifting 2 px frame on at most one element in the viewport.
- Charts as shared fields.
- Everything else flat: nav, cards, tables, forms, footers, and all prose.

Layout: 1200 px working width, 64 px page gutters, the 4-based spacing scale in
multiples of 4 above 26. Sections separated by 1 px `border` rules, never by
alternating background panels.

**Do not** use the gradient as a section background, a hero backdrop, a divider that
spans the page, or a hover state. Those are the four ways this identity turns into
a 2013 startup page.

## Performance

The drift animates `background-position` on a text-clipped element, which is not
GPU-composited — cheap for one or two elements, visibly expensive for twenty. That
cost is a useful guardrail: if the page feels heavy, you have too many mixed
elements, which was already a design error.

## Checks

1. `prefers-reduced-motion: reduce` → flat cyan, zero animations.
2. Text is visible with `background-clip: text` unsupported.
3. Exactly one gradient text element per page; at most one drifting frame per
   viewport.
4. `a`, `a:hover`, and `::selection` are all defined.
5. Print stylesheet: no plasma, no dither, static gradient frame.
6. All prose in IBM Plex Mono at ≥ 15 px with line-height ≥ 1.6.
