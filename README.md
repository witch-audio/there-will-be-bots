# agigame.live

Real-time browser game tracking the live AI race. Players join a shared world where AI company bots are already competing — built with React, Vite, Mapbox, and PartyKit.

## What the game is

You are a human wildcard dropped into a live AI race against real company bots:

- OpenAI, Google, Anthropic, xAI, Meta, DeepSeek, Alibaba, Microsoft

The bots, headlines, contracts, and live briefings are derived from a **world snapshot** built from public AI race signals:

- Artificial Analysis leaderboard
- Arena leaderboard
- Official company news / blog pages

The snapshot updates every ~12 hours. The game is not random chaos — it reflects real signals.

## Game loop

Every second, the PartyKit server advances one tick:

- Farms and launched products generate compute
- Opinion can boost or hurt income
- Status effects tick down
- Bots decide to build, launch, shield, or attack
- Live contract progress updates
- Win condition checks for `20,000` compute

First bot or human to hit the threshold ends the round.

## New in this version

- **AGI Score** — composite spectator leaderboard tracking each lab's real-world lead
- **Prediction markets** — Kalshi-style panels with odds %, translucent UI, terminal bar
- **Draft / swap** — pick and swap your position before the round starts
- **Seasons** — persistent season structure across rounds
- **Human leaderboard** — separate leaderboard for human players
- **Real-world sync** — game state seeded from live AI race data, not fake RNG

## Local setup

1. Install packages:

   ```bash
   npm install
   ```

2. Copy the env example and add your values:

   ```bash
   cp .env.example .env
   ```

3. Start the PartyKit room in one terminal:

   ```bash
   npm run dev:party
   ```

4. Start the Vite app in a second terminal:

   ```bash
   npm run dev
   ```

5. Open the app at `http://127.0.0.1:5173/`.

## Local multiplayer testing

- Use separate browser profiles or a private window for the second player.
- Tabs in the same profile share local storage and will reuse the same saved player id.

## Environment variables

- `VITE_MAPBOX_TOKEN`: Mapbox public token for the globe.
- `VITE_PARTYKIT_HOST`: PartyKit host for the frontend WebSocket connection.
  - Local default: `localhost:1999`
  - Production example: `your-project.your-name.partykit.dev`

## Deploy

### Frontend

Deploy the Vite site to Netlify. The repo includes a `netlify.toml`, so Netlify will use:

- Build command: `npm run build`
- Publish directory: `dist`

Set these environment variables in Netlify before the production deploy:

- `VITE_MAPBOX_TOKEN`
- `VITE_PARTYKIT_HOST`

### PartyKit room

Deploy the PartyKit server separately:

```bash
npm run deploy:party
```

On first deploy, PartyKit will give you a production host in the format:

```
<project-name>.<your-account>.partykit.dev
```

Use that value as `VITE_PARTYKIT_HOST` in Netlify.

### Recommended production order

1. Log in to PartyKit:

   ```bash
   npx partykit login
   ```

2. Deploy the PartyKit server:

   ```bash
   npm run deploy:party
   ```

3. Log in to Netlify:

   ```bash
   npx netlify login
   ```

4. Create or link a Netlify site:

   ```bash
   npx netlify init
   ```

5. Set the frontend environment variables:

   ```bash
   npx netlify env:set VITE_MAPBOX_TOKEN your_mapbox_public_token
   npx netlify env:set VITE_PARTYKIT_HOST your-project.your-name.partykit.dev
   ```

6. Deploy a preview:

   ```bash
   npm run deploy:netlify:preview
   ```

7. Deploy production:

   ```bash
   npm run deploy:netlify
   ```

The shared room id is `main-world` — every player lands in the same live match.

## Key files

| File | Purpose |
|---|---|
| `party/index.ts` | PartyKit server — match authority, bot AI, tick loop, win condition |
| `src/world/sync.ts` | Real-world sync — fetches AI leaderboards, maps signals into game state |
| `src/multiplayer/contracts.ts` | Shared type contract between server and client |
| `src/store/index.ts` | Zustand client store, auto-connects to PartyKit |
| `src/map/GameMap.tsx` | Mapbox globe, city markers, farm markers |
| `CLAUDE_UI_HANDOFF.md` | Full UI context for working on this codebase |
