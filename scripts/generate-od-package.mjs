#!/usr/bin/env node
// Generates the Open Design package contract under design-systems/plasma-pixel/
// from tokens.json: tokens.css (OD shared token schema + pp-* extensions),
// design-tokens.json, tailwind-v4.css, and components.manifest.json.
//
// Run: node scripts/generate-od-package.mjs
// DESIGN.md, USAGE.md, components.html, and manifest.json are authored files —
// the folder is importable by Open Design only when all files are present.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "design-systems/plasma-pixel");
const tokens = JSON.parse(readFileSync(join(root, "core/tokens/tokens.json"), "utf8"));

const c = tokens.color;
const m = tokens.motion;

/* ---------- OD shared-schema mapping (A1 / A2 / B-slot) ---------- */

const mapping = [
  // surface
  ["--bg", c.void, "Page background — the near-black canvas."],
  ["--surface", c.panel, "Panel / card fill."],
  ["--surface-warm", "var(--surface)", "Tertiary surface tier — aliased: plasma has no third tier."],
  // foreground
  ["--fg", c.textPrimary, "Primary reading text."],
  ["--fg-2", "var(--fg)", "Secondary emphasis — aliased (plasma has one prose tier)."],
  ["--muted", c.textSecondary, "Secondary text / captions."],
  ["--meta", c.textTertiary, "Tertiary — uppercase micro-labels ONLY, never prose."],
  // border
  ["--border", c.border, "1px chrome border, dividers."],
  ["--border-soft", c.borderSoft, "Muted / disabled border."],
  // accent
  ["--accent", c.cyan, "Primary accent = cyan. Live/normal state, flat state of mixed data."],
  ["--accent-on", c.void, "Foreground on cyan (loud button)."],
  ["--accent-hover", `color-mix(in oklab, ${c.cyan}, black 8%)`, "Cyan is stable; slight darken only."],
  ["--accent-active", `color-mix(in oklab, ${c.cyan}, black 14%)`, "Depressed state."],
  // semantic
  ["--success", c.green, "Positive states (gradient stop, also semantic)."],
  ["--warn", c.yellow, "Attention — active segment, section headers, low balance."],
  ["--danger", c.magenta, "Urgent — also the hard shadow colour and ghost A."],
  // fonts
  ["--font-display", '"Silkscreen", monospace', "Numbers, labels, titles — caps. Never prose."],
  ["--font-body", '"IBM Plex Mono", ui-monospace, monospace', "All reading text."],
  ["--font-mono", '"IBM Plex Mono", ui-monospace, monospace', "Data, kbd, tabular metrics."],
  // type scale (open density steps; display may extend to 220px hero)
  ["--text-xs", "11px", "Micro-label — caps, tracking .08em."],
  ["--text-sm", "12px", "Small label."],
  ["--text-base", "15px", "Body prose floor."],
  ["--text-lg", "20px", "Display heading."],
  ["--text-xl", "26px", "Display heading."],
  ["--text-2xl", "34px", "Display heading."],
  ["--text-3xl", "46px", "Display heading / hero metric."],
  ["--text-4xl", "64px", "Hero metric (may reach 220px; tile = size x 1.6)."],
  // leading & tracking
  ["--leading-body", "1.6", "Prose leading."],
  ["--leading-tight", "1", "Caps display leading — one line at line-height 1."],
  ["--tracking-display", "0.06em", "Caps display tracking."],
  // spacing — 4-based scale core
  ["--space-1", "4px", "Spacing base 4."],
  ["--space-2", "8px", ""],
  ["--space-3", "12px", ""],
  ["--space-4", "16px", ""],
  ["--space-5", "20px", ""],
  ["--space-6", "24px", ""],
  ["--space-8", "32px", ""],
  ["--space-12", "48px", ""],
  // section rhythm (open density)
  ["--section-y-desktop", "96px", "Vertical section padding — desktop."],
  ["--section-y-tablet", "64px", "Vertical section padding — tablet."],
  ["--section-y-phone", "48px", "Vertical section padding — phone."],
  // radius — the identity is radius 0. Everything. No exceptions in web.
  ["--radius-sm", "0", "Zero radius — buttons, inputs."],
  ["--radius-md", "0", "Zero radius — cards."],
  ["--radius-lg", "0", "Zero radius — featured containers."],
  ["--radius-pill", "0", "Zero radius — no pills, no circles, ever."],
  // elevation — hard offset shadows, blur 0
  ["--elev-flat", "none", "Flat."],
  ["--elev-ring", "0 0 0 1px var(--border)", "The 1px chrome border as a ring."],
  ["--elev-raised", `4px 4px 0 var(--pp-magenta)`, "Hard offset shadow — solid colour, zero blur."],
  // focus
  ["--focus-ring", "0 0 0 2px var(--accent)", "2px solid cyan — no glow, no ring blur."],
  // motion — the identity's whole inventory
  ["--motion-fast", "120ms", "State change (focus, hover, press) — linear."],
  ["--motion-base", "280ms", "Screen transition — snappy ease-out."],
  ["--ease-standard", "linear", "State changes are linear; only the Mix cycles use ease-in-out."],
  // layout
  ["--container-max", "1200px", "Web working width."],
  ["--container-gutter-desktop", "64px", "Page gutter."],
  ["--container-gutter-tablet", "48px", "Page gutter."],
  ["--container-gutter-phone", "24px", "Page gutter."],
];

/* ---------- pp-* brand extensions (C-layer, allowlisted per brand) ---------- */

const extensionMap = [
  ["--pp-magenta", c.magenta, "Urgent / shadow colour / ghost A."],
  ["--pp-violet", c.violet, "Scheduled (regular alerts)."],
  ["--pp-ultra-action", c.ultraAction, "Strong action calls (watch side button)."],
  ["--pp-gradient", tokens.gradient.css, "The one gradient — first and last stop identical, seamless tile."],
  ["--pp-dither", "repeating-conic-gradient(rgba(0,0,0,.60) 0% 25%, transparent 0% 50%)", "Background texture over plasma. Off in kill state, never under small text."],
  ["--pp-dither-size", "4px 4px", "Dither tile."],
  ["--pp-plasma", "radial-gradient(ellipse at 25% -25%, color-mix(in oklab, var(--accent) 35%, transparent), transparent 60%), radial-gradient(ellipse at 75% -25%, color-mix(in oklab, var(--pp-magenta) 35%, transparent), transparent 60%), radial-gradient(ellipse at 50% 125%, color-mix(in oklab, var(--pp-violet) 30%, transparent), transparent 60%)", "Visible only in the kill state's absence — off in always-on / print / email."],
  ["--pp-speed", `${m.speedPxPerSecond}`, "The gradient always travels 10 px/s."],
  ["--pp-tile-ratio", `${m.tileRatio}`, "Tile = 1.6x the rendered block height."],
  ["--pp-min-duration", `${m.minDurationSeconds}s`, "Never a drift cycle shorter than 3s."],
  ["--pp-ghost-cycle", `${m.ghostCycleSeconds}s`, "Ghost cross — ease-in-out, infinite."],
  ["--pp-ghost-phase", `${m.ghostPhaseOffsetSeconds}s`, "Ghost B is half a phase behind Ghost A."],
  ["--pp-ghost-opacity", `${m.ghostOpacity}`, "Ghost opacity."],
  ["--pp-skew", `${m.skewDegrees}deg`, "Hero skew amplitude — one element per screen."],
  ["--pp-skew-cycle", `${m.skewCycleSeconds}s`, "Hero skew cycle."],
  ["--pp-frame-tile", `${m.frameTile}px`, "Canonical frame tile — frames are not text, 1.6x does not apply."],
  ["--pp-frame-duration", `${m.frameDurationSeconds}s`, "Frame drift duration."],
  ["--pp-live-dot", "1.4s", "Status dot blink — steps(2), never a fade."],
];

const name = (row) => row[0];

/* ---------- tokens.css ---------- */

const decl = (rows) => rows.map(([n, v]) => `  ${n}: ${v};`).join("\n");
const slotCache = Object.fromEntries(mapping.map(([n, v]) => [n, v]));

const keyframes = m.tilesInUse
  .map(T => `@keyframes pp-drift-${T} { to { background-position: 0 -${T}px; } }`).join("\n");

const tokensCss = `/* Plasma Pixel — OD package tokens. GENERATED from tokens.json. Do not edit.
 *
 * Maps the design system into the Open Design shared token contract
 * (A1-identity / A1-structure / A2 / B-slot) plus brand extensions
 * (C-layer, --pp-*). Agents: paste the :root block verbatim into the
 * first <style> of an artifact, then resolve every value via var(--*).
 *
 * What this file cannot express, DESIGN.md does (the Mix, shared-field
 * arithmetic, densities, platform rules). Both must stay synchronized.
 */
:root {
${decl(mapping)}

${decl(extensionMap)}
}

/* One keyframe per distinct tile height; each travels exactly -T. */
${keyframes}

@keyframes pp-ghost { 0%,100% { transform: translateX(var(--pp-g, 1px)); }
                      50%     { transform: translateX(calc(-1 * var(--pp-g, 1px))); } }

@keyframes pp-skew  { 0%,100% { transform: skewX(0deg) translateX(0); }
                      50%     { transform: skewX(var(--pp-skew)) translateX(0.5px); } }

@keyframes pp-steps { 50% { opacity: 0; } }

/* Frame variant — the gradient on a 2px-padded container, solid child inside. */
.pp-frame {
  padding: 2px;
  background: var(--pp-gradient);
  background-size: 100% var(--pp-frame-tile);
  animation: pp-frame-drift var(--pp-frame-duration) linear infinite;
  box-shadow: var(--elev-raised);
}
@keyframes pp-frame-drift { to { background-position: 0 calc(-1 * var(--pp-frame-tile)); } }

/* Kill switch — off, never dimmed. */
@media (prefers-reduced-motion: reduce) {
  [data-pp-mix], [data-pp-mix] * { animation: none !important; }
  [data-pp-mix] [data-pp-fill] {
    background-image: none !important;
    -webkit-text-fill-color: var(--accent) !important;
    color: var(--accent) !important;
  }
  [data-pp-mix] [data-pp-ghost], [data-pp-mix] [data-pp-texture] { display: none !important; }
}
`;
writeFileSync(join(pkg, "tokens.css"), tokensCss);

/* ---------- design-tokens.json (agrees with tokens.css by construction) ---------- */

const designTokens = {
  schemaVersion: "od-design-system-project/v1",
  name: tokens.$name,
  version: tokens.$version,
  tokenSets: {
    shared: Object.fromEntries(mapping.map(([n, v]) => [n, v])),
    extensions: Object.fromEntries(extensionMap.map(([n, v]) => [n, v])),
  },
};
writeFileSync(join(pkg, "design-tokens.json"), JSON.stringify(designTokens, null, 2) + "\n");

/* ---------- tailwind-v4.css (colors + fonts from the same map) ---------- */

const twFonts = mapping.filter(([n]) => /^--font-/.test(n))
  .map(([n, v]) => [n, v]);
const twNames = mapping
  .filter(([n]) => /^--(bg|surface|fg|fg-2|muted|meta|border|border-soft|accent|accent-on|success|warn|danger)$/.test(n))
  .map(([n, v]) => [n.replace(/^--/, "--color-"), v]);
const tailwind = `@theme {
${twNames.map(([n, v]) => `  ${n}: ${v};`).join("\n")}
${twFonts.map(([n, v]) => `  ${n}: ${v};`).join("\n")}
}
`;
writeFileSync(join(pkg, "tailwind-v4.css"), tailwind);

/* ---------- components.manifest.json (derived from fixtures) ---------- */

const html = readFileSync(join(pkg, "components.html"), "utf8");
const css = readFileSync(join(pkg, "tokens.css"), "utf8");

const declared = [...new Set([...css.matchAll(/^\s{2}(--[\w-]+):/gm)].map(m => m[1]))];
const referenced = [...new Set([...html.matchAll(/var\((--[\w-]+)/g)].map(m => m[1]))];
const styleBlocks = (html.match(/<style>/g) ?? []).length;
const selectors = (html.match(/^(\.[\w-]+|body|section|::selection)([,{\s]|$)/gm) ?? [])
  .map(s => s.trim().split(",")[0].replace(/[{\s:].*$/, ""))
  .filter(Boolean);
const classCount = new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)))
  .size;
const elementCount = (html.match(/<(button|input|label|nav|a|table|thead|tbody|tr|th|td|section|div|span|br)/g) ?? [])
  .length;

const componentGroups = [
  { id: "mix-hero", name: "Mix hero metric", selectors: ["mix", "mix-fill", "mix-ghost", "mix-ghost.b"] },
  { id: "buttons", name: "Buttons", selectors: ["btn", "btn-primary", "btn-secondary", "btn-loud", "btn-disabled"] },
  { id: "inputs", name: "Inputs", selectors: ["input", "input-error", "input-error-msg", "field-label"] },
  { id: "toggle", name: "Toggle", selectors: ["toggle", "toggle-track", "toggle-knob", "toggle-label"] },
  { id: "segmented", name: "Segmented control", selectors: ["segmented", "segmented button.active"] },
  { id: "cards", name: "Cards", selectors: ["card", "card-hierarchy", "card-featured", "pp-frame"] },
  { id: "table", name: "Table", selectors: ["table", "table th", "table td", "table tbody tr:hover"] },
  { id: "nav", name: "Navigation", selectors: ["nav", "nav a", "nav a.active"] },
  { id: "status-dots", name: "Status dots", selectors: ["dot", "dot-live", "dot-warn", "dot-danger"] },
  { id: "bar-chart", name: "Bar chart (shared field)", selectors: ["bars", "bar", "bar.empty"] },
];

const manifest = {
  schemaVersion: 1,
  brandId: "plasma-pixel",
  source: {
    componentsHtml: "components.html",
    tokensCss: "tokens.css",
  },
  fixture: {
    title: "Plasma Pixel — reference components",
    description: "Reference fixture for design-systems/plasma-pixel. Every visible value comes from tokens.css; the page itself follows the identity — near-black surfaces, radius 0, hard offset magenta shadows, Silkscreen caps labels, IBM Plex Mono prose, exactly one Mixed hero (3 layers, skew), a shared-field bar chart, and the reduce-motion kill switch in the same stylesheet.",
    styleBlockCount: styleBlocks,
    selectorCount: selectors.length,
    classCount,
    elementCount,
  },
  tokens: {
    declared,
    referenced,
    missing: referenced.filter(r => !declared.includes(r)),
  },
  components: componentGroups,
};
writeFileSync(join(pkg, "components.manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

/* ---------- parity guard: fixture :root must mirror tokens.css :root ---------- */

const fixtureCss = readFileSync(join(pkg, "components.html"), "utf8");
const propRegex = /(?:^|\n)\s{2}(--[\w-]+):\s*([^;]+);/g;
const rootOf = (s) => {
  const out = {};
  for (const m of s.matchAll(propRegex)) out[m[1]] = m[2].trim();
  return out;
};
const a = rootOf(css);
const b = rootOf(fixtureCss);
const drift = Object.keys(a).filter(k => a[k] !== b[k]);
const missing = Object.keys(a).filter(k => !(k in b));
if (drift.length || missing.length) {
  console.error("PARITY FAIL: components.html :root drifted from tokens.css :root");
  console.error("  missing:", missing.join(", "));
  console.error("  different:", drift.map(k => `${k}: ${a[k]} != ${b[k]}`).join(" | "));
  process.exit(1);
}
console.log("parity ok: components.html :root mirrors tokens.css :root");

console.log("tokens.css, design-tokens.json, tailwind-v4.css, components.manifest.json regenerated");