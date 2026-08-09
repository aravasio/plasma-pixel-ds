# Plasma Pixel — Usage

Design system package guide for Open Design agents and reviewers.

## Read Order

1. Read this file first to understand the package contract.
2. Read `DESIGN.md` for the identity, the Mix, and the anti-patterns.
3. Paste the `:root` block from `tokens.css` into the first artifact `<style>`
   block before writing any component CSS. Resolve every value via `var(--*)`.
4. Use `components.manifest.json` for the compact component inventory; open
   `components.html` when exact selectors, states, or the Mix implementation
   matter.
5. For anything outside the shared schema (`--pp-*`), the value is authoritative
   in `tokens.css` and `DESIGN.md`.

## Design Highlights

- **The Mix is the identity.** Not an option, not an animation library: three
  layers (gradient fill clipped to glyphs, magenta ghost A, cyan ghost B half a
  phase behind, optional −2.5° skew on the hero) applied all together or not at
  all. White silk. If you choose between effects, you have left the system.
- The gradient is **one sheet**: same gradient, same `background-size`, shared
  field delays (formula in DESIGN.md §2) so colour crosses a bar group.
- Zero radius, zero blur: every shadow is `4px 4px 0 <solid colour>` (magenta on
  cyan), every border 1 px chrome or 2 px hierarchy, every corner square.
- Semantic alarm rule: when the data IS the alarm (e.g. low balance) it is flat
  `--warn` and must not drift.
- Kill switch: `prefers-reduced-motion` → flat `--accent` data, zero animations,
  texture off. Off, never dimmed.
- Brand extensions live under `--pp-*` (gradient, dither, plasma, tile
  arithmetic). If the OD repo guard rejects them, add them to
  `BRAND_EXTENSIONS["plasma-pixel"]` in `packages/contracts/src/design-systems/token-schema.ts`.

## Do

- Preserve the schema token names exactly so cross-brand switching stays
  reliable — an artifact must render correctly when `tokens.css` is swapped for
  another brand's.
- Give every screen exactly one skewed hero and keep every other element still.
- Use `--accent` for primary actions, links, focus states, and live indicators.
- Reuse component groups from `components.manifest.json` before inventing new
  controls.
- Keep the type contract: Silkscreen for numbers/labels (caps), IBM Plex Mono
  for sentences, never the reverse.

## Avoid

- Avoid raw hex values outside the copied `:root` token block.
- Avoid radii, glows, blur shadows, fades — the identity is hard-edged.
- Avoid the gradient as a background, a button fill, a hover state, or anything
  a sentence sits on.
- Avoid adding component recipes not represented in `components.html` or
  `DESIGN.md`.
- Avoid "dimming" the kill state — reduce-motion output must be flat cyan data
  with nothing running.