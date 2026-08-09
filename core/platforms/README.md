# Platforms

The core is platform-agnostic on purpose. These files are where it meets a real
platform's constraints — and where the platform wins.

**The precedence rule, once, for all platforms:** where the identity and a platform
convention collide, **the platform wins on accessibility** — touch target size,
contrast floors, reduce-motion, Dynamic Type, focus order, VoiceOver — and **the
identity wins on everything else**: colour, radius, shadow, type choice, motion
character, density. Nobody has to relitigate that per screen.

| File | Surface |
|---|---|
| `macos.md` | menu bar, popover, window chrome |
| `ios.md` | app screens, notifications, Live Activities |
| `watchos.md` | notifications, complications, Smart Stack |
| `web.md` | pages, dashboards, email, print |

Each file covers the same four things: what the platform forbids, what it forces,
what the Mix looks like there, and the checks specific to it.
