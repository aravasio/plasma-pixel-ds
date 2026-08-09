# Publishing this repository

The remote already exists: `git@github.com:aravasio/plasma-pixel-ds.git`

```bash
cd plasma-pixel-ds
git init -b main
git add .
git commit -m "Plasma Pixel core 1.1.0 — identity, tokens, spec, prototypes"
git remote add origin git@github.com:aravasio/plasma-pixel-ds.git
git push -u origin main
```

Worth doing right after the first push:

- **Description:** *Plasma Pixel — a design identity built on colour that moves through a shape instead of sitting on it.*
- **Topics:** `design-system`, `design-identity`, `demoscene`, `pixel-art`, `swiftui`, `watchos`, `css`

The two typefaces are intentionally not vendored (see `README.md` § Fonts). To ship
them anyway, put Silkscreen and IBM Plex Mono in `fonts/` with the OFL text beside
them.

## Structure

```
IDENTITY.md              the identity: principles, densities, where it does not belong
core/
  DESIGN.md              one-file summary — paste into a design-to-code tool
  MIX.md                 the mechanism, with ports
  COMPONENTS.md          agnostic component recipes
  tokens/                tokens.json is the source of truth; CSS and Swift generated
  examples/              Plasma Pixel Core.dc.html — live sheet at open density
apps/saldobar/           the first application: spec, handoff, prototypes
```
