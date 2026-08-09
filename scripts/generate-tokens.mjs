#!/usr/bin/env node
// Generates tokens.css and PlasmaPixelTokens.swift from tokens.json.
// Run: node scripts/generate-tokens.mjs
// tokens.json is the ONLY file you edit by hand. The other two are build output.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(join(root, "core/tokens/tokens.json"), "utf8"));

const kebab = k => k.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
const hexToRGB = h => [1, 3, 5].map(i => (parseInt(h.slice(i, i + 2), 16) / 255).toFixed(4));

/* ---------- CSS ---------- */

const vars = Object.entries(tokens.color)
  .map(([k, v]) => `  --pp-${kebab(k)}: ${v};`).join("\n");

const drifts = tokens.motion.tilesInUse
  .map(T => `@keyframes pp-drift-${T} { to { background-position: 0 -${T}px; } }`).join("\n");

const css = `/* Plasma Pixel tokens — GENERATED from tokens.json. Do not edit. */
:root {
${vars}

  --pp-gradient: ${tokens.gradient.css};
  --pp-dither: repeating-conic-gradient(rgba(0,0,0,.60) 0% 25%, transparent 0% 50%);
  --pp-dither-size: 4px 4px;

  --pp-radius: ${tokens.shape.radius};
  --pp-radius-popover: ${tokens.shape.radiusExceptions.popover}px;
  --pp-border-chrome: 1px solid var(--pp-border);

  --pp-speed: ${tokens.motion.speedPxPerSecond};
  --pp-tile-ratio: ${tokens.motion.tileRatio};
  --pp-ghost-cycle: ${tokens.motion.ghostCycleSeconds}s;
  --pp-ghost-opacity: ${tokens.motion.ghostOpacity};
  --pp-skew: ${tokens.motion.skewDegrees}deg;
  --pp-skew-cycle: ${tokens.motion.skewCycleSeconds}s;
  --pp-frame-tile: ${tokens.motion.frameTile}px;
  --pp-frame-duration: ${tokens.motion.frameDurationSeconds}s;
}

/* One keyframe per distinct tile height. Each travels exactly -T. */
${drifts}

@keyframes pp-ghost { 0%,100% { transform: translateX(var(--pp-g, 1px)); }
                      50%     { transform: translateX(calc(-1 * var(--pp-g, 1px))); } }

@keyframes pp-skew { 0%,100% { transform: skewX(0deg) translateX(0); }
                     50%     { transform: skewX(var(--pp-skew)) translateX(0.5px); } }

/* Kill switch. Off, never dimmed. */
@media (prefers-reduced-motion: reduce) {
  [data-pp-mix] * { animation: none !important; }
  [data-pp-mix] [data-pp-fill] { background-image: none !important;
    -webkit-text-fill-color: var(--pp-cyan) !important; color: var(--pp-cyan) !important; }
  [data-pp-mix] [data-pp-ghost], [data-pp-mix] [data-pp-texture] { display: none !important; }
}
`;
writeFileSync(join(root, "core/tokens/tokens.css"), css);

/* ---------- Swift ---------- */

const swiftColors = Object.entries(tokens.color).map(([k, v]) => {
  const [r, g, b] = hexToRGB(v);
  return `    static let ${k} = Color(red: ${r}, green: ${g}, blue: ${b}) // ${v}`;
}).join("\n");

const swiftStops = tokens.gradient.stops.map(([pos, hex]) => {
  const name = Object.entries(tokens.color).find(([, v]) => v === hex)?.[0] ?? "magenta";
  return `        .init(color: Palette.${name}, location: ${(parseFloat(pos) / 100).toFixed(2)}),`;
}).join("\n");

const swift = `// Plasma Pixel tokens — GENERATED from tokens.json. Do not edit.

import SwiftUI

public enum PP {

    public enum Palette {
${swiftColors}
    }

    /// First and last stop are identical so the tile repeats seamlessly.
    public static let gradientStops: [Gradient.Stop] = [
${swiftStops}
    ]

    public enum Motion {
        public static let pixelsPerSecond: Double = ${tokens.motion.speedPxPerSecond}
        public static let tileRatio: Double = ${tokens.motion.tileRatio}
        public static let minDuration: Double = ${tokens.motion.minDurationSeconds}
        public static let ghostCycle: Double = ${tokens.motion.ghostCycleSeconds}
        public static let ghostPhaseOffset: Double = ${tokens.motion.ghostPhaseOffsetSeconds}
        public static let ghostOpacity: Double = ${tokens.motion.ghostOpacity}
        public static let skewDegrees: Double = ${tokens.motion.skewDegrees}
        public static let skewCycle: Double = ${tokens.motion.skewCycleSeconds}
        public static let frameTile: CGFloat = ${tokens.motion.frameTile}
        public static let frameDuration: Double = ${tokens.motion.frameDurationSeconds}

        public static func tile(for size: CGFloat) -> CGFloat { (size * CGFloat(tileRatio)).rounded() }
        public static func duration(for tile: CGFloat) -> Double { Double(tile) / pixelsPerSecond }
        public static func ghostOffset(for size: CGFloat) -> CGFloat { max(1, (size / 16).rounded()) }

        /// Shared-field delay, so a group of bars reads as one sheet of gradient.
        public static func sharedFieldDelay(containerHeight H: CGFloat, elementHeight h: CGFloat,
                                            tile T: CGFloat, duration D: Double) -> Double {
            -Double(((H - h).truncatingRemainder(dividingBy: T)) / T) * D
        }
    }

    public enum Shape {
        public static let radius: CGFloat = ${tokens.shape.radius}
        public static let popoverRadius: CGFloat = ${tokens.shape.radiusExceptions.popover}
        public static let spacing: [CGFloat] = [${tokens.spacing.join(",")}]
    }

    public enum Typeface {
        public static let display = "${tokens.type.display.family}"
        public static let prose = "${tokens.type.prose.family}"
        public static let displayFloorMac: CGFloat = ${tokens.type.display.floorMac}
        public static let displayFloorWatch: CGFloat = ${tokens.type.display.floorWatch}
        public static let proseFloor: CGFloat = ${tokens.type.prose.floor}
    }
}
`;
writeFileSync(join(root, "core/tokens/PlasmaPixelTokens.swift"), swift);

console.log("tokens.css and PlasmaPixelTokens.swift regenerated from tokens.json");
