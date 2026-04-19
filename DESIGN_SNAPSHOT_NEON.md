# Design Snapshot — "Neon Vibe-Coded"

Snapshot taken 2026-04-18, before the Kalshi-inspired redesign. Revert to this look by restoring the tokens and component styles below.

## Color Tokens (`src/index.css` `@theme`)

```css
--color-neon-cyan: #00ffff;
--color-neon-green: #00ff88;
--color-neon-magenta: #ff00ff;
--color-neon-orange: #ff6600;
--color-neon-red: #ff3333;
--color-dark-bg: #0a0a1a;
--color-dark-panel: #111128;
--color-dark-card: #1a1a3a;
--color-dark-border: #2a2a4a;
--font-mono: "JetBrains Mono", "Fira Code", "SF Mono", monospace;
```

Body: `background: #0a0a1a; color: #e0e0ff; font-family: var(--font-mono);`

## Component Style Vocabulary

### Leaderboard (top strip)
- Container: `absolute inset-x-0 top-0 z-20 border-b border-dark-border bg-dark-bg/85 backdrop-blur-md`
- Header row: agigame.live · chapter title · Day N · progress bar · DraftChip
- Lab card: `min-w-[180px] rounded-lg border px-3 py-2`, leader glow `border-neon-green/50 bg-neon-green/5 shadow-[0_0_24px_rgba(34,197,94,0.15)]`
- Score: `text-2xl font-bold tabular-nums`, trend arrows `▲ ▼ –` in neon-green / neon-red / gray-500
- Sub-chips: `rounded-full border border-dark-border px-1.5 py-0.5 text-[9px]` for AA #x, Arena #y, N launches

### MarketsPanel (right rail, `top-28 right-4 w-72`)
- Market card: `rounded-xl border border-dark-border bg-dark-card/60 p-3`
- Status chip: green `bg-neon-green/20 text-neon-green` open, orange `bg-neon-orange/20 text-neon-orange` locked
- Option buttons: 2-col grid, `rounded-lg border`; picked = `border-neon-cyan/80 bg-neon-cyan/10 text-neon-cyan`
- Resolved card: dimmed gray, win = neon-green "+10 pts", loss = neon-red "0 pts"

### HumanLeaderboard (`bottom-16 right-4 w-72`)
- Collapsible pill button → expanded list of 20
- User row highlight: `bg-neon-cyan/10 text-neon-cyan`

### LabSpotlight (center card, rotates top 3 every ~15s)
- Large floating card with "NOW LEADING" kicker, lab name + AGI score, tagline, headline, "OFFICIAL NEWS →" link
- Uses lab color + neon-cyan accents

### LiveStatusBar (thin bottom strip)
- `● LIVE` dot + "Updated Xm ago · Next sync Xh Xm"
- Magenta "LIVE FEED" label on far left

### GameMap (backdrop)
- Mapbox globe, non-interactive
- Ambient rotation, city dots decorative

## Signature Visual Traits
- Heavy neon cyan / magenta / green accents
- Multiple solid borders (`border-dark-border`)
- Floating panel stack (3 separate right-side panels)
- Each panel has its own backdrop-blur card chrome
- Mono font globally
- `▲ ▼` trend arrows
- Glow shadows on leader (`shadow-[0_0_24px_...]`)
- Rainbow color semantics (cyan/green/magenta/orange used interchangeably)

## Layout Positions

| Element | Position |
|---|---|
| Leaderboard | `absolute inset-x-0 top-0 z-20` |
| MarketsPanel | `absolute right-4 top-28 w-72 z-30` |
| HumanLeaderboard | `absolute right-4 bottom-16 w-72 z-30` |
| LabSpotlight | center of screen |
| LiveStatusBar | bottom strip |
| NewsTicker | bottom above LiveStatusBar |
| DraftChip | inside Leaderboard header (right side) |

## Files That Define This Look
- `src/index.css`
- `src/ui/Leaderboard.tsx`
- `src/ui/MarketsPanel.tsx`
- `src/ui/HumanLeaderboard.tsx`
- `src/ui/LabSpotlight.tsx`
- `src/ui/LiveStatusBar.tsx`
- `src/ui/DraftChip.tsx`
- `src/ui/DraftPicker.tsx`
- `src/ui/NewsTicker.tsx`
- `src/ui/ToastNotification.tsx`

To revert: `git diff main -- src/index.css src/ui/` from this commit backward.
