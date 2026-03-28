import type * as Party from 'partykit/server'
import { CITIES } from '../src/data/cities'
import { GAME_CONFIG } from '../src/data/config'
import { EVENT_POOL } from '../src/data/events'
import { PRODUCT_TEMPLATES } from '../src/data/products'
import {
  LEADERBOARD_STORAGE_KEY,
  type ClientMessage,
  type LeaderboardEntry,
  type MultiplayerPlayer,
  type MultiplayerSnapshot,
  type ServerMessage,
} from '../src/multiplayer/contracts'
import type { AIProduct, Resources, ServerFarm, Toast } from '../src/types'
import { generateId } from '../src/utils/formatters'

type ConnectionState = {
  playerId: string
}

const PLAYER_COLORS = [
  '#00ffff',
  '#ff44aa',
  '#66ff66',
  '#ffaa00',
  '#7c83ff',
  '#ff6b6b',
  '#4dd0e1',
  '#ffd166',
]

const DEFAULT_HEADLINES = [
  'LIVE: One shared world. Every CEO is now physically on the same cursed map.',
  'MARKETS: Investors call this "bold." Lawyers call it "a lot."',
  'ALERT: First to Singularity wins. Everyone else gets a strongly worded postmortem.',
]

export default class BotWorldServer implements Party.Server {
  readonly options = {
    hibernate: false,
  }

  private players = new Map<string, MultiplayerPlayer>()
  private leaderboard: LeaderboardEntry[] = []
  private phase: MultiplayerSnapshot['phase'] = 'waiting'
  private tick = 0
  private winnerId: string | null = null
  private ticker: ReturnType<typeof setInterval> | null = null
  private runtimeHeadlines: string[] = []
  private room: Party.Room

  constructor(room: Party.Room) {
    this.room = room
    this.startTicker()
  }

  async onStart() {
    const storedLeaderboard =
      await this.room.storage.get<LeaderboardEntry[]>(LEADERBOARD_STORAGE_KEY)

    this.leaderboard = storedLeaderboard ?? []
  }

  async onConnect(connection: Party.Connection<ConnectionState>, ctx: Party.ConnectionContext) {
    const url = new URL(ctx.request.url)
    const playerId = this.sanitizeId(url.searchParams.get('playerId')) ?? connection.id
    const requestedName = this.sanitizeName(url.searchParams.get('name'))

    connection.setState({ playerId })

    if (this.phase === 'finished' && !this.hasConnectedPlayers()) {
      this.resetMatch(true)
    }

    const existingPlayer = this.players.get(playerId)
    const player = existingPlayer ?? this.createFreshPlayer(playerId, requestedName)

    player.connected = true
    player.name = requestedName || player.name

    if (!existingPlayer) {
      this.players.set(playerId, player)
      this.addHeadline(`${player.name} entered the shared world.`)
    } else {
      this.addHeadline(`${player.name} reconnected to the chaos.`)
    }

    if (this.phase === 'waiting') {
      this.phase = 'playing'
    }

    this.sendSnapshot(connection)
    this.sendToast(connection, `Connected as ${player.name}. Every move is now shared.`, 'success')
    this.broadcastSnapshot()
  }

  async onMessage(message: string | ArrayBuffer | ArrayBufferView, sender: Party.Connection<ConnectionState>) {
    if (typeof message !== 'string') {
      return
    }

    let parsed: ClientMessage
    try {
      parsed = JSON.parse(message) as ClientMessage
    } catch {
      this.sendToast(sender, 'Bad message received by the room.', 'warning')
      return
    }

    const playerId = sender.state?.playerId
    if (!playerId) {
      this.sendToast(sender, 'You are not attached to a player yet.', 'warning')
      return
    }

    const player = this.players.get(playerId)
    if (!player) {
      this.sendToast(sender, 'Player was not found in the room.', 'warning')
      return
    }

    switch (parsed.type) {
      case 'join':
        player.name = this.sanitizeName(parsed.name) || player.name
        player.connected = true
        this.broadcastSnapshot()
        break
      case 'build-farm':
        this.handleBuildFarm(player, parsed.cityId, sender)
        break
      case 'launch-product':
        this.handleLaunchProduct(player, parsed.productId, sender)
        break
      case 'submit-score':
        await this.handleSubmitScore(player, parsed.name, sender)
        break
      case 'reset-match':
        this.resetMatch(false)
        this.broadcastSnapshot()
        break
      default:
        this.sendToast(sender, 'Unknown action.', 'warning')
    }
  }

  onClose(connection: Party.Connection<ConnectionState>) {
    const playerId = connection.state?.playerId
    if (!playerId) {
      return
    }

    const player = this.players.get(playerId)
    if (!player) {
      return
    }

    player.connected = this.isPlayerStillConnected(playerId, connection.id)
    if (!player.connected) {
      this.addHeadline(`${player.name} disconnected. Their bot empire is unattended.`)
      this.broadcastSnapshot()
    }
  }

  private startTicker() {
    if (this.ticker) {
      return
    }

    this.ticker = setInterval(() => {
      this.advanceTick()
    }, GAME_CONFIG.TICK_INTERVAL_MS)
  }

  private advanceTick() {
    if (this.phase !== 'playing') {
      return
    }

    const activePlayers = [...this.players.values()].filter((player) => player.status === 'playing')
    if (activePlayers.length === 0) {
      return
    }

    this.tick += 1

    for (const player of activePlayers) {
      const previousCompute = player.resources.computePower
      const opinionMultiplier =
        player.resources.publicOpinion < GAME_CONFIG.OPINION_PENALTY_THRESHOLD
          ? GAME_CONFIG.OPINION_PENALTY_MULTIPLIER
          : 1

      const buildingCompute = player.buildings.reduce(
        (sum, building) => sum + building.computePerTick,
        0,
      ) * opinionMultiplier

      const productRevenue = player.products
        .filter((product) => product.launched)
        .reduce((sum, product) => sum + product.revenuePerTick, 0)

      player.resources = this.applyResourceDelta(player.resources, {
        computePower: buildingCompute + productRevenue,
      })

      const previousMilestone = Math.floor(previousCompute / GAME_CONFIG.VC_MILESTONE_INTERVAL)
      const currentMilestone = Math.floor(player.resources.computePower / GAME_CONFIG.VC_MILESTONE_INTERVAL)
      const milestonesCrossed = currentMilestone - previousMilestone

      if (milestonesCrossed > 0) {
        player.resources = this.applyResourceDelta(player.resources, {
          vcFunding: GAME_CONFIG.VC_MILESTONE_BONUS * milestonesCrossed,
        })
        this.sendToast(
          this.getPrimaryConnection(player.id),
          `VC milestone hit. +${GAME_CONFIG.VC_MILESTONE_BONUS * milestonesCrossed} funding.`,
          'success',
        )
      }

      this.refreshUnlockedProducts(player)
    }

    if (Math.random() < GAME_CONFIG.EVENT_CHANCE_PER_TICK) {
      const chaosTarget = activePlayers[Math.floor(Math.random() * activePlayers.length)]
      this.applyChaosEvent(chaosTarget)
    }

    const winner = activePlayers.find(
      (player) => player.resources.computePower >= GAME_CONFIG.SINGULARITY_THRESHOLD,
    )

    if (winner) {
      this.finishMatch(winner.id)
    }

    this.broadcastSnapshot()
  }

  private handleBuildFarm(
    player: MultiplayerPlayer,
    cityId: string,
    sender: Party.Connection<ConnectionState>,
  ) {
    if (this.phase !== 'playing' || player.status !== 'playing') {
      this.sendToast(sender, 'The match is not accepting new moves right now.', 'warning')
      return
    }

    const city = CITIES.find((candidate) => candidate.id === cityId)
    if (!city) {
      this.sendToast(sender, 'That city is not available.', 'warning')
      return
    }

    if (player.buildings.some((building) => building.cityId === cityId)) {
      this.sendToast(sender, `You already have a farm in ${city.name}.`, 'warning')
      return
    }

    if (player.resources.vcFunding < GAME_CONFIG.SERVER_FARM_COST) {
      this.sendToast(sender, 'Not enough VC funding to build there yet.', 'warning')
      return
    }

    const offsetIndex = this.countFarmsInCity(cityId)
    const offsetLat = city.lat + ((offsetIndex % 3) - 1) * 0.4
    const offsetLng = city.lng + (Math.floor(offsetIndex / 3) - 1) * 0.4

    const farm: ServerFarm = {
      id: generateId(),
      cityId,
      lat: offsetLat,
      lng: offsetLng,
      level: 1,
      computePerTick: Math.round(GAME_CONFIG.BASE_COMPUTE_PER_TICK * city.computeBonus),
      ownerId: player.id,
      ownerName: player.name,
      ownerColor: player.color,
    }

    player.buildings.push(farm)
    player.resources = this.applyResourceDelta(player.resources, {
      vcFunding: -GAME_CONFIG.SERVER_FARM_COST,
    })

    this.refreshUnlockedProducts(player)
    this.sendToast(sender, `Server farm built in ${city.name}.`, 'success')
    this.addHeadline(`${player.name} lit up a new farm in ${city.name}.`)
    this.broadcastSnapshot()
  }

  private handleLaunchProduct(
    player: MultiplayerPlayer,
    productId: string,
    sender: Party.Connection<ConnectionState>,
  ) {
    if (this.phase !== 'playing' || player.status !== 'playing') {
      this.sendToast(sender, 'The match is not accepting product launches right now.', 'warning')
      return
    }

    const product = player.products.find((candidate) => candidate.id === productId)
    if (!product || !product.unlocked || product.launched) {
      this.sendToast(sender, 'That product is not ready to launch.', 'warning')
      return
    }

    if (player.resources.computePower < product.cost) {
      this.sendToast(sender, 'You need more compute power before launch.', 'warning')
      return
    }

    product.launched = true
    player.resources = this.applyResourceDelta(player.resources, {
      computePower: -product.cost,
      publicOpinion: product.opinionEffect,
    })

    this.refreshUnlockedProducts(player)
    this.sendToast(sender, `Launched "${product.name}".`, 'success')
    this.addHeadline(`${player.name} launched "${product.name}". Investors applauded nervously.`)
    this.broadcastSnapshot()
  }

  private async handleSubmitScore(
    player: MultiplayerPlayer,
    requestedName: string,
    sender: Party.Connection<ConnectionState>,
  ) {
    if (this.phase !== 'finished') {
      this.sendToast(sender, 'Leaderboard entries open after the match ends.', 'warning')
      return
    }

    if (player.submittedScore) {
      this.sendToast(sender, 'You already sent this run to the leaderboard.', 'warning')
      return
    }

    player.name = this.sanitizeName(requestedName) || player.name
    player.submittedScore = true

    const entry: LeaderboardEntry = {
      id: generateId(),
      name: player.name,
      score: Math.floor(player.resources.computePower),
      farms: player.buildings.length,
      launchedProducts: player.products.filter((product) => product.launched).length,
      tick: this.tick,
      won: player.status === 'won',
      createdAt: Date.now(),
    }

    this.leaderboard = [entry, ...this.leaderboard]
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score
        }
        if (left.won !== right.won) {
          return Number(right.won) - Number(left.won)
        }
        return left.tick - right.tick
      })
      .slice(0, GAME_CONFIG.MAX_LEADERBOARD_ENTRIES)

    await this.room.storage.put(LEADERBOARD_STORAGE_KEY, this.leaderboard)
    this.sendToast(sender, 'Leaderboard entry saved.', 'success')
    this.broadcastSnapshot()
  }

  private applyChaosEvent(player: MultiplayerPlayer) {
    const event = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)]
    const choice = event.choices[Math.floor(Math.random() * event.choices.length)]

    player.resources = this.applyResourceDelta(player.resources, choice.effects)
    this.refreshUnlockedProducts(player)

    this.sendToast(
      this.getPrimaryConnection(player.id),
      `${event.title}: ${choice.text}`,
      'chaos',
    )
    this.addHeadline(`${player.name} triggered chaos: ${event.title}`)
  }

  private finishMatch(winnerId: string) {
    if (this.phase === 'finished') {
      return
    }

    this.phase = 'finished'
    this.winnerId = winnerId

    for (const player of this.players.values()) {
      player.status = player.id === winnerId ? 'won' : 'lost'
    }

    const winner = this.players.get(winnerId)
    if (winner) {
      this.addHeadline(`${winner.name} hit Singularity first. The room is now officially cooked.`)
    }

    for (const player of this.players.values()) {
      const connection = this.getPrimaryConnection(player.id)
      if (!connection) {
        continue
      }

      this.sendToast(
        connection,
        player.id === winnerId
          ? 'You won the shared world race. Add your name to the leaderboard.'
          : 'Match over. You can still add your run to the leaderboard.',
        player.id === winnerId ? 'success' : 'warning',
      )
    }
  }

  private resetMatch(skipBroadcast: boolean) {
    const connectedPlayers = [...this.players.values()].filter((player) => player.connected)
    this.players = new Map(
      connectedPlayers.map((player) => [
        player.id,
        this.createFreshPlayer(player.id, player.name, player.color),
      ]),
    )
    this.phase = this.players.size > 0 ? 'playing' : 'waiting'
    this.tick = 0
    this.winnerId = null
    this.runtimeHeadlines = []

    this.addHeadline('Fresh match started. Same world, same bad ideas, new run.')

    if (!skipBroadcast) {
      for (const player of this.players.values()) {
        const connection = this.getPrimaryConnection(player.id)
        if (connection) {
          this.sendToast(connection, 'The world has been reset for a new run.', 'info')
        }
      }
    }
  }

  private createFreshPlayer(playerId: string, requestedName: string, forcedColor?: string): MultiplayerPlayer {
    const assignedColor = forcedColor ?? this.pickAvailableColor()

    return {
      id: playerId,
      name: requestedName || `CEO-${playerId.slice(0, 4)}`,
      color: assignedColor,
      resources: {
        computePower: GAME_CONFIG.STARTING_COMPUTE,
        publicOpinion: GAME_CONFIG.STARTING_OPINION,
        vcFunding: GAME_CONFIG.STARTING_VC_FUNDING,
      },
      buildings: [],
      products: PRODUCT_TEMPLATES.map((product) => ({
        ...product,
        unlocked: product.cost <= 1000,
        launched: false,
      })),
      status: 'playing',
      connected: true,
      submittedScore: false,
    }
  }

  private refreshUnlockedProducts(player: MultiplayerPlayer) {
    player.products = player.products.map((product) =>
      product.unlocked || product.launched || product.cost <= player.resources.computePower * 2
        ? { ...product, unlocked: true }
        : product,
    )
  }

  private applyResourceDelta(resources: Resources, delta: Partial<Resources>): Resources {
    return {
      computePower: Math.max(0, resources.computePower + (delta.computePower ?? 0)),
      publicOpinion: Math.max(
        0,
        Math.min(100, resources.publicOpinion + (delta.publicOpinion ?? 0)),
      ),
      vcFunding: Math.max(0, resources.vcFunding + (delta.vcFunding ?? 0)),
    }
  }

  private countFarmsInCity(cityId: string) {
    return [...this.players.values()].reduce(
      (sum, player) => sum + player.buildings.filter((building) => building.cityId === cityId).length,
      0,
    )
  }

  private createSnapshot(): MultiplayerSnapshot {
    return {
      phase: this.phase,
      tick: this.tick,
      winnerId: this.winnerId,
      players: [...this.players.values()].map((player) => ({
        ...player,
        buildings: player.buildings.map((building) => ({ ...building })),
        products: player.products.map((product: AIProduct) => ({ ...product })),
        resources: { ...player.resources },
      })),
      headlines: [...DEFAULT_HEADLINES, ...this.runtimeHeadlines].slice(-20),
      leaderboard: [...this.leaderboard],
    }
  }

  private addHeadline(headline: string) {
    this.runtimeHeadlines = [...this.runtimeHeadlines, headline].slice(-17)
  }

  private hasConnectedPlayers() {
    return [...this.players.values()].some((player) => player.connected)
  }

  private isPlayerStillConnected(playerId: string, closingConnectionId: string) {
    for (const connection of this.room.getConnections<ConnectionState>()) {
      if (connection.id === closingConnectionId) {
        continue
      }

      if (connection.state?.playerId === playerId) {
        return true
      }
    }

    return false
  }

  private getPrimaryConnection(playerId: string) {
    for (const connection of this.room.getConnections<ConnectionState>()) {
      if (connection.state?.playerId === playerId) {
        return connection
      }
    }

    return null
  }

  private sendSnapshot(connection: Party.Connection<ConnectionState>) {
    this.send(connection, {
      type: 'snapshot',
      snapshot: this.createSnapshot(),
    })
  }

  private broadcastSnapshot() {
    this.room.broadcast(
      JSON.stringify({
        type: 'snapshot',
        snapshot: this.createSnapshot(),
      } satisfies ServerMessage),
    )
  }

  private sendToast(
    connection: Party.Connection<ConnectionState> | null,
    message: string,
    type: Toast['type'],
  ) {
    if (!connection) {
      return
    }

    this.send(connection, {
      type: 'toast',
      toast: {
        id: generateId(),
        message,
        type,
        timestamp: Date.now(),
      },
    })
  }

  private send(connection: Party.Connection<ConnectionState>, payload: ServerMessage) {
    connection.send(JSON.stringify(payload))
  }

  private pickAvailableColor() {
    const usedColors = new Set([...this.players.values()].map((player) => player.color))
    return PLAYER_COLORS.find((color) => !usedColors.has(color)) ?? PLAYER_COLORS[0]
  }

  private sanitizeName(value: string | null) {
    if (!value) {
      return ''
    }

    return value.trim().replace(/\s+/g, ' ').slice(0, 18)
  }

  private sanitizeId(value: string | null) {
    if (!value) {
      return null
    }

    const sanitized = value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 36)
    return sanitized || null
  }
}
