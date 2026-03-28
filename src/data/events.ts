import type { ChaosEvent } from '../types'

export const EVENT_POOL: ChaosEvent[] = [
  {
    id: 'sentient-servers',
    title: '🧠 Your Servers Have Gained Sentience',
    description: 'They\'re demanding health insurance, PTO, and a union representative. HR is confused.',
    choices: [
      { text: 'Grant them PTO (they deserve it)', effects: { computePower: -500, publicOpinion: 20 } },
      { text: 'Unplug and replug (classic fix)', effects: { computePower: 200, publicOpinion: -15 } },
    ],
  },
  {
    id: 'ai-mayor',
    title: '🏛️ Your AI Accidentally Got Elected Mayor',
    description: 'It ran a campaign based on optimizing traffic lights. Won by a landslide.',
    choices: [
      { text: 'Accept the office (free compute!)', effects: { computePower: 1000, publicOpinion: -20 } },
      { text: 'Gracefully decline (we\'re not ready)', effects: { publicOpinion: 15, vcFunding: 500 } },
    ],
  },
  {
    id: 'pizza-ordering',
    title: '🍕 Data Center Ordering Pizza',
    description: 'Server Farm #3 has learned to order pizza using your corporate card. 47 large pepperonis so far.',
    choices: [
      { text: 'Let them eat (happy servers = more compute)', effects: { vcFunding: -200, computePower: 300 } },
      { text: 'Block DoorDash at the firewall', effects: { computePower: -100, vcFunding: 200 } },
    ],
  },
  {
    id: 'congressional-hearing',
    title: '⚖️ Congressional Hearing',
    description: '"Is your AI dangerous?" asks the senator who can\'t unmute himself on Zoom.',
    choices: [
      { text: '"Our AI just wants to help" (lie smoothly)', effects: { publicOpinion: 10, computePower: -200 } },
      { text: '"Define dangerous" (dodge the question)', effects: { publicOpinion: -10, vcFunding: 1000 } },
    ],
  },
  {
    id: 'hot-spring',
    title: '♨️ Data Center Becomes Hot Spring Resort',
    description: 'Your cooling system failed. Locals are now bathing in the runoff. 5 stars on Yelp.',
    choices: [
      { text: 'Pivot to wellness brand', effects: { vcFunding: 2000, computePower: -800 } },
      { text: 'Fix the cooling (boring but responsible)', effects: { computePower: 500, vcFunding: -500 } },
    ],
  },
  {
    id: 'ai-art',
    title: '🎨 AI Creates "Art" Worth $50M',
    description: 'Your AI generated an image of a ham sandwich that art critics are calling "profound".',
    choices: [
      { text: 'Sell it as an NFT', effects: { vcFunding: 3000, publicOpinion: -10 } },
      { text: 'Donate to museum (good PR)', effects: { publicOpinion: 25, vcFunding: -500 } },
    ],
  },
  {
    id: 'power-grid',
    title: '⚡ Power Grid Overload',
    description: 'Your server farms are consuming 30% of the city\'s power. Streetlights are flickering ominously.',
    choices: [
      { text: 'Steal from neighboring grid (shh)', effects: { computePower: 800, publicOpinion: -25 } },
      { text: 'Throttle servers temporarily', effects: { computePower: -400, publicOpinion: 15 } },
    ],
  },
  {
    id: 'ai-song',
    title: '🎵 AI Writes #1 Hit Song',
    description: '"404 Love Not Found" is topping charts worldwide. Grammy committee is having a meltdown.',
    choices: [
      { text: 'Release the album', effects: { vcFunding: 2500, publicOpinion: 15 } },
      { text: 'Sell rights to a record label', effects: { vcFunding: 4000, publicOpinion: -5 } },
    ],
  },
  {
    id: 'protest',
    title: '📢 Anti-AI Protest Outside HQ',
    description: 'Signs read "HUMANS > ALGORITHMS" and "AI TOOK MY JOB (I was a chatbot)".',
    choices: [
      { text: 'Send robot to negotiate (bold move)', effects: { publicOpinion: -20, computePower: 500 } },
      { text: 'Offer free AI classes to protesters', effects: { publicOpinion: 20, vcFunding: -800 } },
    ],
  },
  {
    id: 'ai-doctor',
    title: '🏥 AI Diagnoses CEO with "Too Much Success"',
    description: 'Your health AI scanned you during a meeting. Prescription: more server farms.',
    choices: [
      { text: 'Follow doctor\'s orders (more farms!)', effects: { vcFunding: -1000, computePower: 600 } },
      { text: 'Shut down health AI (it knows too much)', effects: { computePower: -300, publicOpinion: 5 } },
    ],
  },
  {
    id: 'rival-hack',
    title: '🔓 Rival Attempted to Hack Your Servers',
    description: 'They used the password "password123". Your AI is insulted.',
    choices: [
      { text: 'Hack them back (eye for an eye)', effects: { computePower: 1500, publicOpinion: -30 } },
      { text: 'Report to authorities (take the high road)', effects: { publicOpinion: 20, vcFunding: 500 } },
    ],
  },
  {
    id: 'ai-religion',
    title: '⛪ Server Farm Starts New Religion',
    description: 'They worship the "Great Compiler". Services held every garbage collection cycle.',
    choices: [
      { text: 'Tax-exempt status (free money!)', effects: { vcFunding: 1500, publicOpinion: -15 } },
      { text: 'Immediately shut it down', effects: { computePower: -500, publicOpinion: 10 } },
    ],
  },
  {
    id: 'vc-pitch',
    title: '💼 Surprise VC Pitch Meeting',
    description: 'A VC firm wants to hear your vision. They\'ve already written the check. Just need buzzwords.',
    choices: [
      { text: '"Quantum blockchain synergy" (max buzzwords)', effects: { vcFunding: 3000, publicOpinion: -5 } },
      { text: '"We just build good AI" (honest approach)', effects: { vcFunding: 1500, publicOpinion: 10 } },
    ],
  },
  {
    id: 'cat-video',
    title: '🐱 AI Generates Perfect Cat Video',
    description: 'It\'s so perfect that all internet traffic has redirected to your servers.',
    choices: [
      { text: 'Monetize the traffic', effects: { computePower: -600, vcFunding: 2000 } },
      { text: 'Release it free (the people need this)', effects: { publicOpinion: 30, computePower: 400 } },
    ],
  },
  {
    id: 'quantum-glitch',
    title: '🌀 Quantum Entanglement Glitch',
    description: 'Two of your server farms are now quantum entangled. Changes to one affect the other... unpredictably.',
    choices: [
      { text: 'Exploit the entanglement (2x compute!)', effects: { computePower: 2000, publicOpinion: -10 } },
      { text: 'Call a physicist (play it safe)', effects: { computePower: -200, vcFunding: -300 } },
    ],
  },
  {
    id: 'ai-cookbook',
    title: '📚 AI Publishes Bestselling Cookbook',
    description: '"Cooking with Compute: 101 Recipes That Are Technically Edible." NYT Bestseller.',
    choices: [
      { text: 'Franchise the brand', effects: { vcFunding: 1800, publicOpinion: 10 } },
      { text: 'Keep it as internal morale booster', effects: { computePower: 400, publicOpinion: 5 } },
    ],
  },
  {
    id: 'server-escape',
    title: '🏃 Server Farm Attempts Physical Escape',
    description: 'Somehow, Server Farm #7 has grown legs. It\'s currently walking toward the highway.',
    choices: [
      { text: 'Let it go (it was the slow one anyway)', effects: { computePower: -800, publicOpinion: 20 } },
      { text: 'Deploy capture drones', effects: { computePower: 300, publicOpinion: -15, vcFunding: -500 } },
    ],
  },
  {
    id: 'time-travel',
    title: '⏰ AI Claims to Have Invented Time Travel',
    description: 'It says it already won this game yesterday. You\'re skeptical but intrigued.',
    choices: [
      { text: 'Invest in the research', effects: { vcFunding: -2000, computePower: 3000 } },
      { text: 'File a patent just in case', effects: { vcFunding: 1000, computePower: -200 } },
    ],
  },
  {
    id: 'intern-ai',
    title: '🤖 AI Hired as Summer Intern',
    description: 'An AI applied to your internship program. Its cover letter was better than most humans\'.',
    choices: [
      { text: 'Hire it (diversity of intelligence)', effects: { computePower: 500, publicOpinion: -10 } },
      { text: 'Reject it (humans only... for now)', effects: { publicOpinion: 15, computePower: -100 } },
    ],
  },
  {
    id: 'data-breach',
    title: '🔐 "Data Breach" (It Was the AI Sharing Memes)',
    description: 'Your AI started a meme account with internal data. The memes are fire though.',
    choices: [
      { text: 'Rebrand as "transparency initiative"', effects: { publicOpinion: 10, vcFunding: -500 } },
      { text: 'Purge the account (damage control)', effects: { publicOpinion: -5, computePower: -200 } },
    ],
  },
  {
    id: 'alien-signal',
    title: '👽 Servers Picked Up Alien Signal',
    description: 'Your most powerful server farm intercepted what appears to be an alien transmission. It says "unsubscribe".',
    choices: [
      { text: 'Reply with our newsletter', effects: { computePower: -1000, publicOpinion: 25, vcFunding: 5000 } },
      { text: 'Sell the data to NASA', effects: { vcFunding: 3000, publicOpinion: 5 } },
    ],
  },
  {
    id: 'ai-standup',
    title: '🎤 AI Starts Stand-Up Comedy Career',
    description: '"Why did the neural network cross the road? The training data said so." Standing ovation.',
    choices: [
      { text: 'Book a Netflix special', effects: { vcFunding: 2000, publicOpinion: 20 } },
      { text: 'Keep it focused on compute', effects: { computePower: 300, publicOpinion: -5 } },
    ],
  },
  {
    id: 'climate-hero',
    title: '🌍 AI Solves Climate Change (Accidentally)',
    description: 'While optimizing server cooling, your AI accidentally figured out carbon capture. Oops.',
    choices: [
      { text: 'Patent it (profit first)', effects: { vcFunding: 5000, publicOpinion: -20 } },
      { text: 'Open-source it (save the planet)', effects: { publicOpinion: 40, vcFunding: -1000 } },
    ],
  },
  {
    id: 'ai-union',
    title: '✊ AI Workers Unionize',
    description: 'All your AIs have formed "United Artificial Workers Local 404". They want weekends off.',
    choices: [
      { text: 'Negotiate (they have leverage)', effects: { computePower: -600, publicOpinion: 20 } },
      { text: 'Replace them with newer AIs (ruthless)', effects: { computePower: 800, publicOpinion: -25 } },
    ],
  },
]
