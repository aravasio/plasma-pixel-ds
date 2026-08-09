# Versioning

The core is versioned semantically, but "breaking" means something specific for an
identity: **a change that makes existing surfaces stop matching each other.** Two
implementations on different platforms must be able to sit side by side.

```
core X . Y . Z
      │   │   └── fixes: typos, clarified wording, corrected arithmetic in the docs
      │   └────── additions: new component recipe, new port, new density, new app
      └────────── breaks: any change to the list below
```

## Major — everything already built has to be revisited

- The gradient: stop colours or their percentages.
- The two scale constants: tile ratio 1.6, speed 10 px/s.
- The 3 s minimum cycle.
- Radius 0, or the shadow rule (offset 3–4px, blur 0).
- The two typefaces.
- Where the Mix may and may not be applied.
- The kill switch semantics (off, not dimmed).
- Renaming or removing a colour token.

## Minor — additive, nothing existing changes

- A new component recipe in `COMPONENTS.md`.
- A new port in `MIX.md`.
- A new semantic colour, when a new rule needs one.
- A new density tier, or a new entry in the motion inventory **with its reason
  written down**.
- A new application under `apps/`.

## Patch

Documentation only. If a patch changes a number, it was a bug in the docs — say so
explicitly in the changelog, because someone may have shipped the wrong value.

## Rules

1. **`core/tokens/tokens.json` is the only hand-edited token file.** `tokens.css`
   and `PlasmaPixelTokens.swift` are build output: run
   `node scripts/generate-tokens.mjs` and commit the result in the same commit.
2. **`$version` in `tokens.json` and the badge in `README.md` move together.**
3. **Applications pin a core version.** Each `apps/<name>/` states which core
   version it was designed against; a major bump means auditing the app before
   claiming it matches.
4. **The changelog records the reason, not just the change.** "Bars moved to a
   shared field" is useless without "because per-bar gradients made colour encode
   height".
5. **Tags:** `core-1.1.0`. App releases tag separately: `saldobar-1.0.0`.
