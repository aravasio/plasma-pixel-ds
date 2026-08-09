# iOS

The hardest platform for this identity, for one reason: **Dynamic Type.** A pixel
typeface has no intermediate sizes, and iOS users legitimately expect text to grow.

## What the platform forbids

- **You cannot style a notification you did not build.** A push from a third-party
  service renders as system text. A styled banner requires a
  `UNNotificationContentExtension` in your own app.
- **Live Activities and widgets are WidgetKit — they do not animate.** Use the
  static-frame variant from `MIX.md`.
- **No fixed-size layouts.** Safe areas, the Dynamic Island, home indicator, and
  keyboard all move the box.

## What the platform forces

### Dynamic Type — the rule

- **Prose scales normally.** IBM Plex Mono with
  `UIFontMetrics`/`.dynamicTypeSize`, floor 10 pt, no cap.
- **Display type scales in integer multiples only** — 1×, 2×, 3× of its base size.
  A pixel face at 1.35× lands between grid steps and the glyphs go fuzzy, which
  reads as a rendering bug rather than a style.
- **Above `.accessibilityLarge`, display type switches to IBM Plex Mono SemiBold**
  and drops the Mix. At that point the user has told you legibility outranks
  identity, and a 3× pixel numeral wrapping across two lines is not legible.

### Everything else

- **44 × 44 pt minimum touch target**, always — a 12 pt caps label needs padding
  around it, not a bigger label. The identity's small type is a *visual* size, not
  a hit size.
- **Reduce Motion, Reduce Transparency, Increase Contrast, Low Power Mode** all
  feed the kill switch (Reduce Transparency additionally kills the plasma and
  dither).
- **Dark only.** This identity has no light mode. Declare
  `UIUserInterfaceStyle = Dark` and do not fight it — a half-hearted light variant
  is worse than none.
- **ProMotion.** The drift is linear and slow, so it costs nothing at 120 Hz; do
  not add motion just because the frames are cheap.

## The Mix here

Compact density. Two to four mixed elements per screen, one hero. Practically:

- The screen's primary metric carries the full Mix with skew.
- A featured card may carry a drifting 2 px frame — one per viewport.
- A chart is a shared field.
- Nav bars, tab bars, lists, forms, and every label: flat.

Tab bar and nav bar are system components. Tint them with `cyan` and set the bar
background to `void`; do not rebuild them to get square corners.

## Checks

1. At `.accessibilityXXXL`, every screen is readable and no pixel type is
   interpolated.
2. Every tappable element measures ≥ 44 × 44 pt regardless of its label size.
3. Live Activities and widgets render a single gradient frame — not a flat colour,
   not an animation that silently never runs.
4. Low Power Mode: zero animations.
5. VoiceOver reads the metric as one value — the three Mix layers must not be three
   accessibility elements. Mark ghosts as hidden.
