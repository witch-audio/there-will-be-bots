import PartySocket from 'partysocket'
import { create } from 'zustand'
import { GAME_CONFIG } from '../data/config'
import {
  PARTYKIT_ROOM_ID,
  type ClientMessage,
  type LeaderboardEntry,
  type MultiplayerPlayer,
  type MultiplayerSnapshot,
  type ServerMessage,
} from '../multiplayer/contracts'
import type { GamePhase, Toast } from '../types'
import { generateId } from '../utils/formatters'

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

interface GameStore {
  connectionStatus: ConnectionStatus
  partyHost: string
  playerId: string
  playerName: string
  pendingName: string
  localPlayer: MultiplayerPlayer | null
  players: MultiplayerPlayer[]
  otherPlayers: MultiplayerPlayer[]
  leaderboard: LeaderboardEntry[]
  headlines: string[]
  toasts: Toast[]
  tick: number
  roomPhase: MultiplayerSnapshot['phase']
  winnerId: string | null
  gamePhase: GamePhase
  error: string | null
  setPendingName: (name: string) => void
  connectPlayer: () => void
  placeServerFarm: (cityId: string) => void
  launchProduct: (productId: string) => void
  submitScore: (name: string) => void
  resetMatch: () => void
  removeToast: (id: string) => void
}

const PLAYER_ID_STORAGE_KEY = 'there-will-be-bots.player-id'
const PLAYER_NAME_STORAGE_KEY = 'there-will-be-bots.player-name'

let socket: PartySocket | null = null

function loadStoredPlayerId() {
  if (typeof window === 'undefined') {
    return 'local-player'
  }

  const existing = window.localStorage.getItem(PLAYER_ID_STORAGE_KEY)
  if (existing) {
    return existing
  }

  const created = generateId()
  window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, created)
  return created
}

function loadStoredPlayerName() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY) ?? ''
}

function savePlayerName(name: string) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, name)
}

function sanitizePlayerName(name: string) {
  return name.trim().replace(/\s+/g, ' ').slice(0, 18)
}

function getPartyHost() {
  return import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999'
}

function deriveGamePhase(
  roomPhase: MultiplayerSnapshot['phase'],
  localPlayer: MultiplayerPlayer | null,
): GamePhase {
  if (!localPlayer) {
    return 'start'
  }

  if (roomPhase === 'finished') {
    return localPlayer.status === 'won' ? 'won' : 'lost'
  }

  return 'playing'
}

function sortPlayers(players: MultiplayerPlayer[]) {
  return [...players].sort(
    (left, right) => right.resources.computePower - left.resources.computePower,
  )
}

function pushToast(toasts: Toast[], toast: Toast) {
  return [...toasts.slice(-GAME_CONFIG.MAX_TOASTS + 1), toast]
}

function makeLocalToast(message: string, type: Toast['type']): Toast {
  return {
    id: generateId(),
    message,
    type,
    timestamp: Date.now(),
  }
}

function applySnapshot(
  snapshot: MultiplayerSnapshot,
  playerId: string,
  previousName: string,
) {
  const players = sortPlayers(snapshot.players)
  const localPlayer = players.find((player) => player.id === playerId) ?? null

  return {
    players,
    otherPlayers: players.filter((player) => player.id !== playerId),
    localPlayer,
    leaderboard: snapshot.leaderboard,
    headlines: snapshot.headlines,
    tick: snapshot.tick,
    roomPhase: snapshot.phase,
    winnerId: snapshot.winnerId,
    gamePhase: deriveGamePhase(snapshot.phase, localPlayer),
    playerName: localPlayer?.name ?? previousName,
    pendingName: localPlayer?.name ?? previousName,
  }
}

function sendMessage(message: ClientMessage) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    useGameStore.setState((state) => ({
      toasts: pushToast(
        state.toasts,
        makeLocalToast('Not connected to the shared world yet.', 'warning'),
      ),
    }))
    return
  }

  socket.send(JSON.stringify(message))
}

const initialPlayerId = loadStoredPlayerId()
const initialPlayerName = loadStoredPlayerName()

export const useGameStore = create<GameStore>((set, get) => ({
  connectionStatus: 'idle',
  partyHost: getPartyHost(),
  playerId: initialPlayerId,
  playerName: initialPlayerName,
  pendingName: initialPlayerName,
  localPlayer: null,
  players: [],
  otherPlayers: [],
  leaderboard: [],
  headlines: [],
  toasts: [],
  tick: 0,
  roomPhase: 'waiting',
  winnerId: null,
  gamePhase: 'start',
  error: null,

  setPendingName: (name) => set({ pendingName: name }),

  connectPlayer: () => {
    const state = get()
    const nextName = sanitizePlayerName(state.pendingName) || `CEO-${state.playerId.slice(0, 4)}`

    savePlayerName(nextName)

    if (socket) {
      socket.close()
      socket = null
    }

    set({
      connectionStatus: 'connecting',
      error: null,
      playerName: nextName,
      pendingName: nextName,
      toasts: [],
    })

    const nextSocket = new PartySocket({
      host: state.partyHost,
      room: PARTYKIT_ROOM_ID,
      query: async () => ({
        playerId: state.playerId,
        name: nextName,
      }),
    })

    socket = nextSocket

    nextSocket.addEventListener('open', () => {
      if (socket !== nextSocket) {
        return
      }

      set({ connectionStatus: 'connected', error: null })
    })

    nextSocket.addEventListener('message', (event) => {
      if (socket !== nextSocket || typeof event.data !== 'string') {
        return
      }

      let payload: ServerMessage
      try {
        payload = JSON.parse(event.data) as ServerMessage
      } catch {
        set((current) => ({
          toasts: pushToast(
            current.toasts,
            makeLocalToast('Could not read a server update.', 'warning'),
          ),
        }))
        return
      }

      if (payload.type === 'toast') {
        set((current) => ({
          toasts: pushToast(current.toasts, payload.toast),
        }))
        return
      }

      set((current) => ({
        connectionStatus: 'connected',
        error: null,
        ...applySnapshot(payload.snapshot, current.playerId, current.playerName),
      }))
    })

    nextSocket.addEventListener('close', () => {
      if (socket !== nextSocket) {
        return
      }

      set((current) => ({
        connectionStatus: current.localPlayer ? 'connecting' : 'idle',
        error: current.localPlayer ? 'Trying to reconnect to the shared world.' : null,
        toasts: current.localPlayer
          ? pushToast(
              current.toasts,
              makeLocalToast('Connection dropped. Trying again.', 'warning'),
            )
          : current.toasts,
      }))
    })

    nextSocket.addEventListener('error', () => {
      if (socket !== nextSocket) {
        return
      }

      set((current) => ({
        connectionStatus: 'error',
        error: 'Could not reach the PartyKit room.',
        toasts: pushToast(
          current.toasts,
          makeLocalToast('Could not reach the PartyKit room.', 'warning'),
        ),
      }))
    })
  },

  placeServerFarm: (cityId) => {
    sendMessage({
      type: 'build-farm',
      cityId,
    })
  },

  launchProduct: (productId) => {
    sendMessage({
      type: 'launch-product',
      productId,
    })
  },

  submitScore: (name) => {
    const finalName = sanitizePlayerName(name || get().playerName)
    if (finalName) {
      savePlayerName(finalName)
      set({ playerName: finalName, pendingName: finalName })
    }

    sendMessage({
      type: 'submit-score',
      name: finalName,
    })
  },

  resetMatch: () => {
    sendMessage({ type: 'reset-match' })
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}))
