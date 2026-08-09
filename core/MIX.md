# The Mix

The one mechanism of the identity. Three layers, each attacking a different
property so they never compete. Applied together or not at all.

---

## Algorithm

```
mix(text, size, isHero):
    T = round(size × 1.6)          # tile height
    D = T / 10                     # seconds — the gradient always travels 10 px/s
    g = max(1, round(size / 16))   # ghost offset

    container: position relative, width fit-content
        if isHero: skewX 0° → −2.5° → 0°, 3.4s ease-in-out infinite
                   (with translateX 0 → 0.5px → 0 riding along)

        GHOST_A  absolute, inset 0 — the same text, magenta, opacity .75
                 translateX +g → −g → +g, 2.1s ease-in-out infinite
        GHOST_B  identical, cyan, animation-delay −1.05s (half phase)
        FILL     in flow — defines the container size
                 the gradient, background-size 100% T, clipped to the text,
                 background-position 0 0 → 0 −T, D seconds, linear, infinite
```

The three cycles — 3.0 / 2.1 / 3.4s — are coprime, so the exact combined pattern
never repeats, yet no single layer moves fast.

## The two scale rules

**Tile = 1.6× the rendered block height.** For one line that is roughly the font
size at `line-height: 1`; for a two-line block it is the whole block. A tile
smaller than the block makes the text read as a striped rainbow again. This is the
easiest thing to get wrong when moving from a 7px label to a 46px number.

**10 px/s, always — and never a cycle shorter than 3s.** Speed is a constant of the
identity, not a per-element choice, which is why duration falls out of the tile
size. If the formula gives less than 3s the element is too small to carry the Mix:
leave it flat.

## Five ways it breaks

1. **FILL not in flow.** It is the layer that sizes the container; the ghosts are
   absolute. Make FILL absolute too and the container collapses to nothing.
2. **Skew on the fill layer.** Two animations touching `transform` on one element:
   the second wins and the first disappears silently. Skew goes on the container.
3. **A keyframe that does not travel exactly −T.** `−42px` over a 45px tile jumps
   3px per cycle. Every distinct T needs its own keyframe.
4. **No `width: fit-content`.** The absolute ghosts stretch to the parent width and
   the fringe detaches from the glyphs.
5. **Changing the gradient's stop percentages.** They are spaced so no adjacent
   pair has a larger luminance jump than the rest. Move one and a dark seam appears
   somewhere in the cycle.

---

## Variant: frame

For borders, notification frames, and primary CTAs — **FILL only**, on the
background of a 2px-padded container with a solid child inside.

```
frame: padding 2px
       background = the gradient, background-size 100% 58, 5.8s linear infinite
       box-shadow 4px 4px 0 <solid colour>   # no blur
  child: solid background, the real content
```

`T = 58 / D = 5.8s` is canonical for frames regardless of frame size: frames are
not text, so the 1.6× rule does not apply.

Never use the gradient as a **button fill** — the label loses contrast every time
magenta passes, and a button cannot have unreadable moments.

## Variant: shared field

For groups aligned to a common edge — chart bars, segmented controls, tiled cards:

```
delay_i = −(((H − h_i) mod T) ÷ T) × D      # H = container height, h_i = item height
```

Same gradient, same `background-size`, same animation for every item; only the
delay differs. The gradient then crosses the group as one sheet. Give each item its
own gradient instead and short bars all come out magenta, tall bars all violet:
colour starts encoding height, which height already encodes.

## Variant: static frame

Where animation is impossible — widgets, complications, print, email, a still
export — render **one frame** of the gradient and choose the offset that puts cyan
over the glyph. Do not substitute a flat colour: the cut-out-of-a-field quality is
what makes a still frame recognisable.

---

## The kill switch

One derived boolean, true if **any** of: an always-on screen · reduce-motion ·
low power · the surface cannot animate.

When true, every layer goes off — no gradient, no ghosts, no skew, nothing running
— and every mixed value becomes flat cyan. Background texture goes off too.

Do not implement this as "dim the Mix". Dimming the three layers to ~42% drops
magenta below the contrast floor, so the number disappears and reappears on its
own, and it still costs battery.

---

## Ports

**CSS** — as written above. `background-clip: text` with
`-webkit-text-fill-color: transparent`. One `@keyframes` per distinct T.

**SwiftUI** — `TimelineView(.animation)` + a `VStack` of repeated `LinearGradient`s
of height T, offset by `-(t * 10).truncatingRemainder(dividingBy: T)`, inside
`.mask(Text(...))`. `foregroundStyle(LinearGradient)` does not work: it cannot tile
or scroll. Ghosts are a `ZStack` of two flat `Text`s with animated `.offset(x:)`
underneath. Skew is
`.transformEffect(CGAffineTransform(a: 1, b: 0, c: tan(angle), d: 1, tx: 0, ty: 0))`
— `rotationEffect` cannot skew. For a shared field, pass the computed delay as the
**initial phase** of each item's `TimelineView`, not as `.animation(.delay)`.

**Canvas / WebGL** — draw the tiled gradient to an offscreen buffer of height T,
then `globalCompositeOperation = "source-in"` against the rasterised text. Ghosts
are two extra draws before it.

**Android / Compose** — `Brush.linearGradient` with `TileMode.Repeated` on a
`drawWithContent` + `BlendMode.SrcIn` layer; animate the brush's start offset.

**Write it once.** In every port, express the Mix as a single reusable
modifier/component — `.mixFill(size:)`, `.mixGhost(size:)`, `.mixSkew()` — with the
kill switch inside it. Twelve copies of the same arithmetic is how a wrong T gets
into production.
