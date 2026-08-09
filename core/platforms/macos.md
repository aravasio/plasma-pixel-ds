# macOS

The identity's home surface. Most permissive of the four: real animation, real
fonts, no touch targets, and a user who is looking at a screen already full of
chrome — which is exactly why restraint matters more here, not less.

## What the platform forbids

- **You do not own the menu bar.** Your item sits at 26 pt beside system items on
  whatever wallpaper the user chose. Anything that reads as an error, a badge, or a
  system alert is a bug.
- **No control over the vibrancy behind a popover.** Do not rely on translucency —
  set an opaque `void` background and let the system's shadow do the separation.
- **Accent colour and appearance are user settings.** The identity does not follow
  the system accent, but it must follow the appearance change (see below).

## What the platform forces

- **Light and dark menu bars.** Use the light palette from `tokens.json`
  (`colorLightMenuBar`) when `NSApp.effectiveAppearance` is light. Same structure,
  same tile, same speed — only luminance drops. Never invert the identity.
- **Increase Contrast and Reduce Motion** are system toggles, not app settings.
  Reduce Motion feeds the kill switch. Increase Contrast: drop `textTertiary`
  entirely and promote it to `textSecondary`.
- **Popover width is a commitment.** 340 pt is the working figure; the popover
  cannot scroll horizontally and re-flowing pixel type at odd widths breaks the
  grid. Pick one width per app and hold it.
- **Keyboard first.** Every action needs a key equivalent, and the focus ring is
  the system's — do not restyle it into a 2 px cyan border, because that is also
  the identity's input-focus treatment and the two would be indistinguishable.

## The Mix here

Full three layers, at micro density in the menu bar and compact density in the
popover.

- Menu-bar label: `NSStatusItem` + `NSHostingView`, driven by
  `TimelineView(.animation(minimumInterval: 1.0/20.0))`. 20 fps is plenty for
  10 px/s and it is a process that runs all day.
- **Pause when nothing is live.** A menu-bar animation with no unread state is a
  battery leak the user cannot see the cause of.
- One hero in the menu bar (the label) and one in the popover (the primary metric).
  They are different surfaces, so both may skew — but never two inside the popover.
- Low Power Mode is not exposed as cleanly on macOS as on iOS; use
  `ProcessInfo.processInfo.isLowPowerModeEnabled` where available and treat it as
  the kill switch.

## Checks

1. The label is legible on a white wallpaper and a black one, at both appearances.
2. No animation runs while the app has nothing live to report.
3. Popover focus ring is the system's, not a 2 px cyan border.
4. Reduce Motion off: three layers. On: flat cyan, zero running animations.
5. Nothing in the menu bar could be mistaken for a system warning.
