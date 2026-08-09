# Plasma Pixel

A design identity built on one mechanism: **colour that moves through a shape
instead of sitting on it.** Near-black surfaces, pixel type, zero radius, hard
offset shadows — all of it there to give one moving thing a still surface to move
against.

It began as the visual language for a macOS menu-bar app that watches a live
number, and it is written here to travel to other surfaces without being redrawn.

![status](https://img.shields.io/badge/core-1.1.0-7FF9FF?style=flat-square)
![license](https://img.shields.io/badge/docs-MIT-5E5580?style=flat-square)

---

## Read in this order

1. **`IDENTITY.md`** — what the identity is, its five principles, the densities it
   works at, where it does not belong, and how it dies.
2. **`core/MIX.md`** — the mechanism in full: algorithm, scale rules, the three
   variants, the kill switch, and ports for CSS / SwiftUI / canvas / static.
3. **`core/COMPONENTS.md`** — platform-agnostic recipes: buttons, frames, inputs,
   charts, tables, navigation, and the complete motion inventory.
4. **`core/platforms/`** — the identity meeting each platform's real constraints:
   what it forbids, what it forces, what the Mix looks like there, and per-platform
   checks. Read the one you are building on before you start.
5. **`core/DESIGN.md`** — the same material condensed into one self-contained file.
   Paste it into a design-to-code tool as-is.

```
plasma-pixel-ds/
├── IDENTITY.md
├── core/
│   ├── DESIGN.md          one-file summary, pasteable
│   ├── MIX.md             the mechanism
│   ├── COMPONENTS.md      agnostic component recipes
│   ├── platforms/         macOS · iOS · watchOS · web — where the platform wins
│   ├── tokens/            tokens.json is the source of truth
│   └── examples/          live sheet at open density
├── apps/
│   └── saldobar/          the first application — spec, handoff, prototypes
├── scripts/               token generator (tokens.json → css + swift)
├── fonts/                 what to download; nothing vendored
├── VERSIONING.md          what counts as a breaking change to an identity
└── CONTRIBUTING.md        the two questions any change has to answer
```

## Using it on a new surface

Never hand-edit `tokens.css` or `PlasmaPixelTokens.swift` — they are generated:
`node scripts/generate-tokens.mjs`.

1. Import `core/tokens/tokens.css` (or generate your platform's equivalent from
   `tokens.json`). Bundle Silkscreen and IBM Plex Mono.
2. Implement the Mix **once**, as a single reusable component or modifier with the
   kill switch inside it.
3. Pick your density from `IDENTITY.md` and decide, before designing, which single
   element is the hero. One per surface.
4. Build everything else flat, from `COMPONENTS.md`.
5. Run the twelve checks in `apps/saldobar/SPEC.md §10` — they are written against
   that app's numbers, but the arithmetic ones apply anywhere.

The most common failure is applying the Mix generously. A large surface is mostly
prose, so proportionally **less** of it qualifies, not more.

## Fonts

**Silkscreen** and **IBM Plex Mono**, both OFL, both required — there is no system
equivalent. Not vendored here; download from Google Fonts (Silkscreen Regular +
Bold, IBM Plex Mono Regular + SemiBold).

## Applications

| App | Platform | Status |
|---|---|---|
| **SaldoBar** | macOS menu bar + watchOS alerts | hi-fi, ready to implement — `apps/saldobar/` |

## License

Docs and tokens MIT (`LICENSE`). The two typefaces are OFL and not covered by it.
