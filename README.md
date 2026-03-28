# There Will Be Bots

Shared-world multiplayer browser game built with React, Vite, Mapbox, and PartyKit.

## What changed

- One PartyKit room now owns the live match.
- Everyone joins the same world at the same time.
- The match state is shared live across players.
- The leaderboard is the only thing that persists after a run ends.

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
- Tabs in the same profile share local storage, so they will reuse the same saved player id by default.

## Environment variables

- `VITE_MAPBOX_TOKEN`: Mapbox public token for the globe.
- `VITE_PARTYKIT_HOST`: PartyKit host for the frontend WebSocket connection.
  - Local default: `localhost:1999`
  - Production example: `your-project.your-name.partykit.dev`

## Deploy

### Frontend

Deploy the Vite site to Netlify. This repo now includes a [netlify.toml](/Users/rachellarralde/Developer/there-will-be-bots/netlify.toml) file, so Netlify will use:

- Build command: `npm run build`
- Publish directory: `dist`

Set these frontend environment variables in Netlify before the production deploy:

- `VITE_MAPBOX_TOKEN`
- `VITE_PARTYKIT_HOST`

### PartyKit room

Deploy the PartyKit server separately:

```bash
npm run deploy:party
```

On first deploy, PartyKit will give you a production host in the format:

```text
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

The shared room id is still `main-world`, so every player lands in the same live match.
