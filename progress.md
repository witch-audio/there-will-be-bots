Original prompt: i want to have them fight on the same world all at once. leaderboard is the only thing that exists. after the game ends for someone they can add their name to it. can i use partykit for that? and can you help me set it up??

- Added PartyKit packages and project scripts for local dev and deploy.
- Planned architecture: one shared PartyKit room owns the live world, match state stays in memory, leaderboard persists in room storage.
- Added the PartyKit room server with shared match ticking, player actions, auto-chaos, and stored leaderboard entries.
- Replaced the old local Zustand game state with a PartySocket-backed multiplayer store and rewired the main UI screens to it.
- Verified the new setup with local builds, linting, and a two-tab PartyKit test. Added README and env docs for local run and deploy.
- Refreshed the intro screen: animated globe behind a lighter glass card, much shorter copy, and a cleaner one-step join flow. Rechecked the UI in the browser.
- Cleaned up the intro alignment: removed the spinning ring overlay, centered the card/form more tightly, and changed the intro globe motion to a steadier in-place rotation.
- Reworked the foreground again using stronger art direction: removed the chunky modal feel, turned it into a cleaner poster-like center stack, and rebuilt the input/button area as a simpler action tray.
- Fixed gameplay map movement: the intro screen was leaving the map in a non-interactive state, so GameMap now explicitly enables drag/zoom controls when play starts and disables them again on the intro screen.
- Added Netlify deployment config and clearer production steps. Current blocker for live deploy is account auth: this machine is not logged into Netlify or PartyKit yet.
- New goal: turn the shared economy race into a busier boardroom war with direct actions, city powers, live contracts, choice-based chaos events, and always-on company bots.
- Implementation plan for this pass:
  1. Extend the PartyKit snapshot/contracts so players can target rivals, respond to events, and see live contract state.
  2. Seed fixed AI companies (OpenAI, Google, Microsoft, Anthropic, Meta, Amazon) that keep playing every round.
  3. Add frontend panels for actions, contracts, and chaos choices, then retune the start screen around the company-battle theme.
- Implemented the new PartyKit loop:
  - seeded six always-on company bots with different strategies and taglines
  - added executive actions (DDoS, smear, poach, shield)
  - added live contracts with short-term rewards and momentum buffs
  - changed chaos events from auto-rolls into timed choices per player
  - made city specialties matter through launch, ops, funding, scaling, policy, and cooling bonuses
- Implemented the frontend pass:
  - new live contract card
  - new control-room panel for rival actions
  - new chaos-response modal for timed event choices
  - standings now clearly show bots vs humans and company flavor text
  - start screen now frames the room as a live war against real company bots
- Verification:
  - `npm run build` passed
  - `npm run lint` passed
  - browser checks with Playwright + SwiftShader verified bots moving, contracts updating, farms building, control-room actions, and chaos-choice UI rendering
