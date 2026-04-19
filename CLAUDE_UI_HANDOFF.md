# There Will Be Bots: UI Handoff

This file is meant to help Claude Code or any other UI-focused tool understand what the game is doing right now.

The goal is to make UI changes easier without needing to reverse-engineer the whole project first.

## What the game is now

This is a real-time browser game with a shared PartyKit room.

The player joins a live world where AI company bots are already playing against each other.

The game is no longer driven by fake random chaos events.

Instead, the game now uses a "world snapshot" that is built from public AI race signals:

* Artificial Analysis leaderboard
* Arena leaderboard
* Official company news or blog pages

The world snapshot updates about every 12 hours.

The bots, headlines, contracts, and live briefings are all derived from that snapshot.

## Main fantasy of the game

The player is a human wildcard dropped into a live AI race.

The bots represent real companies:

* OpenAI
* Google
* Anthropic
* xAI
* Meta
* DeepSeek
* Alibaba
* Microsoft

The player builds farms, launches products, uses hostile actions, and tries to hit the singularity threshold before the bots do.

## How the game loop works

Every second, the PartyKit server advances one tick.

On each tick:

* farms and launched products generate compute
* opinion can boost or hurt income
* status effects tick down
* bots decide whether to build, launch, shield, or attack
* live contract progress updates
* win condition checks for `20,000` compute

If a bot or human reaches the threshold first, the room ends the round and shows the win/loss screen.

If there are no humans in the room, the world can reset from the latest snapshot.

## Real-world sync model

The real-world sync lives in:

* [src/world/sync.ts](/Users/rachellarralde/Developer/there-will-be-bots/src/world/sync.ts)

That file:

* fetches Artificial Analysis
* fetches Arena
* fetches official company pages
* parses rows and headlines with simple HTML parsing
* maps those signals into game stats
* creates:
  * companies
  * events
  * contracts
  * product catalog

The server stores the result as `WorldSnapshot` in PartyKit storage.

Important idea: the client does not fetch these outside sources directly.

## Server authority

The game server lives in:

* [party/index.ts](/Users/rachellarralde/Developer/there-will-be-bots/party/index.ts)

This file is the real source of truth for the match.

It is responsible for:

* room state
* joining players
* bot behavior
* tick loop
* building farms
* launching products
* using actions
* contracts
* win condition
* syncing and storing the world snapshot
* broadcasting `snapshot` messages to clients

If Claude changes the UI only, it usually should not need to edit this file much.

## Current data contract between server and client

The shared multiplayer contract lives in:

* [src/multiplayer/contracts.ts](/Users/rachellarralde/Developer/there-will-be-bots/src/multiplayer/contracts.ts)

Key pieces the UI receives:

* `players`
* `headlines`
* `activeContract`
* `leaderboard`
* `worldSnapshotMeta`

Each player includes:

* `resources`
* `buildings`
* `products`
* `effects`
* `pendingBriefing`
* `sourceBackedStats`
* `lastUpdatedAt`

`worldSnapshotMeta` currently includes:

* `asOf`
* `stale`
* `nextSyncAt`
* `sourceCount`
* `windowStart`
* `windowEnd`
* `status`

## Client state

The client store lives in:

* [src/store/index.ts](/Users/rachellarralde/Developer/there-will-be-bots/src/store/index.ts)

It uses Zustand.

Important current behavior:

* it auto-connects on load
* it auto-retries after connection errors
* it uses the browser hostname for PartyKit instead of hard-coding `localhost`
* it keeps the latest room snapshot in local state

This means the old intro flow is mostly gone now.

## Current screen structure

The top-level app lives in:

* [src/App.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/App.tsx)

Current layout:

* background 3D globe map
* top HUD bar
* top-center contract card
* left floating buttons and drawers for products and actions
* right floating standings drawer
* bottom news ticker
* center modal for live briefings
* win/loss overlay when round ends

If the player is not connected yet, the app shows a small centered "joining live room" state instead of the old start screen.

## UI files and what they do

Main UI files:

* [src/ui/HUD.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/HUD.tsx)
  * top bar
  * player resources
  * room counts
  * snapshot time
  * progress to singularity
  * temporary effects
* [src/ui/ContractPanel.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/ContractPanel.tsx)
  * current live contract
  * time left
  * player progress
  * top 3 contract leaderboard
* [src/ui/ProductPanel.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/ProductPanel.tsx)
  * available products
  * launch buttons
  * launched products
* [src/ui/ActionPanel.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/ActionPanel.tsx)
  * hostile actions
  * target picker
  * cooldowns and costs
* [src/ui/RivalTracker.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/RivalTracker.tsx)
  * standings
  * bot vs human labels
  * AA rank and Arena rank tags
  * submitted leaderboard
* [src/ui/NewsTicker.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/NewsTicker.tsx)
  * scrolling headlines
  * stale/live label
* [src/ui/ChaosEventModal.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/ChaosEventModal.tsx)
  * now used as a live briefing modal
  * shows sourced event title, summary, companies, source link
* [src/ui/ToastNotification.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/ToastNotification.tsx)
  * small transient messages
* [src/ui/WinLossScreen.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/WinLossScreen.tsx)
  * end-of-round state

There is still a file called:

* [src/ui/StartScreen.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/StartScreen.tsx)

Right now it is not used by `App.tsx`.

## Map and world visuals

The map lives in:

* [src/map/GameMap.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/map/GameMap.tsx)

It uses:

* `react-map-gl`
* Mapbox globe projection
* city markers
* farm markers
* city popup for building

Important note:

The map needs WebGL.

In headless browser tests, WebGL can fail, but the rest of the UI can still render.

For a UI redesign, this means you may want a graceful fallback or a more layered HUD that still works if the map is not the main focus.

## Current gameplay systems

### Cities

Cities come from:

* [src/data/cities.ts](/Users/rachellarralde/Developer/there-will-be-bots/src/data/cities.ts)

Cities matter because they have specialties like:

* launch lab
* policy hub
* ops bunker
* capital hub
* scale yard
* cooling grid

These specialties change costs, defense, funding, opinion, and compute behavior.

### Actions

Actions come from:

* [src/data/actions.ts](/Users/rachellarralde/Developer/there-will-be-bots/src/data/actions.ts)

Current actions:

* `ddos`
* `smear`
* `poach`
* `shield`

### Bots

Bot roster and source aliases live in:

* [src/data/companies.ts](/Users/rachellarralde/Developer/there-will-be-bots/src/data/companies.ts)

Each company has:

* color
* tagline
* strategy
* source aliases for parsing
* official news URL
* platform weight used in stat mapping

### Products

Player product math is used by:

* [src/utils/playerState.ts](/Users/rachellarralde/Developer/there-will-be-bots/src/utils/playerState.ts)

The actual product list now comes from the world snapshot first.

If the snapshot does not provide a useful product catalog, the server creates fallback product entries.

## What "real-world" means in the current build

This is not a true AGI tracker.

It is a game layer built on public signals.

Right now the server uses those signals to estimate:

* compute strength
* public opinion
* VC or war chest power
* recent launches
* event headlines

Those estimates are then turned into game stats for bots and contracts.

## Current known rough edges

These are important for Claude to know before changing the UI:

* The UI still looks like a game prototype with many floating panels, even though the data is now more like a live dashboard
* The file name `ChaosEventModal` is outdated because it now shows sourced briefings, not fake chaos choices
* `StartScreen.tsx` still exists but is no longer part of the main flow
* The ticker can get noisy because it mixes fixed intro headlines with runtime actions
* The left and right panel layout can feel crowded on smaller screens
* The contract card and briefing modal are important, but the current design does not make them feel important enough
* The player is still called `CEO`, `VC Funding`, and `Singularity`, so the UI language is still half game and half real-world mirror

## Safe areas for UI redesign

Claude can redesign the presentation pretty aggressively without changing the game logic if it mostly stays inside:

* [src/App.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/App.tsx)
* [src/ui/HUD.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/HUD.tsx)
* [src/ui/ContractPanel.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/ContractPanel.tsx)
* [src/ui/ProductPanel.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/ProductPanel.tsx)
* [src/ui/ActionPanel.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/ActionPanel.tsx)
* [src/ui/RivalTracker.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/RivalTracker.tsx)
* [src/ui/NewsTicker.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/NewsTicker.tsx)
* [src/ui/ChaosEventModal.tsx](/Users/rachellarralde/Developer/there-will-be-bots/src/ui/ChaosEventModal.tsx)
* [src/index.css](/Users/rachellarralde/Developer/there-will-be-bots/src/index.css)

## Areas to be careful with

If Claude edits these, it should understand the gameplay logic first:

* [party/index.ts](/Users/rachellarralde/Developer/there-will-be-bots/party/index.ts)
* [src/world/sync.ts](/Users/rachellarralde/Developer/there-will-be-bots/src/world/sync.ts)
* [src/multiplayer/contracts.ts](/Users/rachellarralde/Developer/there-will-be-bots/src/multiplayer/contracts.ts)
* [src/store/index.ts](/Users/rachellarralde/Developer/there-will-be-bots/src/store/index.ts)
* [src/types/index.ts](/Users/rachellarralde/Developer/there-will-be-bots/src/types/index.ts)

## Recommended UI direction

If the next goal is a better UI, the strongest direction is probably:

* treat the game more like a live command center or war room
* make the world snapshot feel like the main event
* make contracts and briefings feel like urgent moments
* make bot standings feel more like a live race board
* reduce the number of separate floating boxes
* keep the map, but make it support the story instead of carrying the whole page

One simple mental model:

* top = status and snapshot time
* center = world map and live race
* side rail = actions and products
* bottom = feed and briefings

## Useful commands

Run frontend:

* `npm run dev`

Run PartyKit:

* `npm run dev:party`

Build:

* `npm run build`

Lint:

* `npm run lint`

## Final note for Claude

The most important thing to preserve is this:

The game is now a live AI race mirror with game verbs layered on top.

So the new UI should probably feel less like "random neon toy" and more like "stylized real-time AI market war room."
