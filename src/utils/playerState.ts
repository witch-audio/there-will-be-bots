import { CITIES } from '../data/cities'
import { EXECUTIVE_ACTIONS } from '../data/actions'
import type { MultiplayerPlayer } from '../multiplayer/contracts'
import type { AIProduct, CitySpecialty, ExecutiveActionId } from '../types'

const cityById = new Map(CITIES.map((city) => [city.id, city]))
const actionById = new Map(EXECUTIVE_ACTIONS.map((action) => [action.id, action]))

export function getSpecialtyCount(player: MultiplayerPlayer | null, specialty: CitySpecialty) {
  if (!player) {
    return 0
  }

  return player.buildings.reduce((count, building) => {
    const city = cityById.get(building.cityId)
    return count + (city?.specialty === specialty ? 1 : 0)
  }, 0)
}

export function getFarmCost(player: MultiplayerPlayer | null) {
  return Math.max(900, 1500 - getSpecialtyCount(player, 'scale-yard') * 150)
}

export function getLaunchCost(player: MultiplayerPlayer | null, product: Pick<AIProduct, 'cost'>) {
  return Math.round(product.cost * (getSpecialtyCount(player, 'launch-lab') > 0 ? 0.8 : 1))
}

export function getActionCost(player: MultiplayerPlayer | null, actionId: ExecutiveActionId) {
  const action = actionById.get(actionId)
  if (!action) {
    return 0
  }

  return Math.round(action.cost * (getSpecialtyCount(player, 'ops-bunker') > 0 ? 0.8 : 1))
}

export function getActionCooldown(player: MultiplayerPlayer | null, actionId: ExecutiveActionId) {
  const action = actionById.get(actionId)
  if (!action) {
    return 0
  }

  return Math.max(2, action.cooldown - getSpecialtyCount(player, 'ops-bunker') * 2)
}
