# Fonts

Both required, both SIL Open Font License 1.1, neither vendored here — download and
drop them in this folder if you want the repo self-contained.

| Family | Weights used | Source |
|---|---|---|
| **Silkscreen** | 400, 700 | https://fonts.google.com/specimen/Silkscreen |
| **IBM Plex Mono** | 400, 600 | https://fonts.google.com/specimen/IBM+Plex+Mono |

```
fonts/
├── Silkscreen-Regular.ttf
├── Silkscreen-Bold.ttf
├── IBMPlexMono-Regular.ttf
├── IBMPlexMono-SemiBold.ttf
└── OFL.txt
```

There is no system equivalent for either on macOS, watchOS, or the web — an app has
to bundle and register them. Fallbacks: `monospace` for both, which loses the
identity entirely, so treat a missing font as a build failure rather than a
degradation.

**Silkscreen is never used for prose at any size.** Its x-height makes a sentence
unreadable, and the pixel grid fights the eye at reading length. If a surface needs
long text, it needs IBM Plex Mono.
