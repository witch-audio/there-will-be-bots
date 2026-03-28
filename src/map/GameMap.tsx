import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Map, { Marker, NavigationControl, Popup, type MapRef } from 'react-map-gl/mapbox'
import { GAME_CONFIG } from '../data/config'
import { CITIES } from '../data/cities'
import { useGameStore } from '../store'
import type { City, ServerFarm } from '../types'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const GAMEPLAY_VIEW = {
  longitude: -40,
  latitude: 20,
  zoom: 2.5,
  pitch: 45,
  bearing: 0,
} as const

const START_VIEW = {
  longitude: 10,
  latitude: 18,
  zoom: 1.65,
  pitch: 14,
  bearing: 0,
} as const

export default function GameMap() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const mapRef = useRef<MapRef | null>(null)
  const localPlayer = useGameStore((s) => s.localPlayer)
  const players = useGameStore((s) => s.players)
  const gamePhase = useGameStore((s) => s.gamePhase)
  const placeServerFarm = useGameStore((s) => s.placeServerFarm)

  const localBuildings = localPlayer?.buildings ?? []
  const allBuildings = useMemo(
    () =>
      players.flatMap((player) =>
        player.buildings.map((building) => ({
          ...building,
          ownerColor: building.ownerColor ?? player.color,
          ownerName: building.ownerName ?? player.name,
        })),
      ),
    [players],
  )

  const handleCityClick = useCallback((city: City) => {
    if (gamePhase !== 'playing') {
      return
    }

    setSelectedCity(city)
  }, [gamePhase])

  const handlePlaceFarm = useCallback(() => {
    if (!selectedCity) {
      return
    }

    placeServerFarm(selectedCity.id)
    setSelectedCity(null)
  }, [placeServerFarm, selectedCity])

  const localCityIds = localBuildings.map((building) => building.cityId)
  const canAfford = (localPlayer?.resources.vcFunding ?? 0) >= GAME_CONFIG.SERVER_FARM_COST
  const alreadyBuiltHere = selectedCity ? localCityIds.includes(selectedCity.id) : false
  const showGameplayMarkers = gamePhase !== 'start'

  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) {
      return
    }

    const isPlaying = gamePhase === 'playing'
    const interactiveClassTarget = map.getCanvasContainer()

    if (isPlaying) {
      map.dragPan.enable()
      map.scrollZoom.enable()
      map.doubleClickZoom.enable()
      map.touchZoomRotate.enable()
      map.touchPitch.enable()
      map.keyboard.enable()
      interactiveClassTarget.classList.add('mapboxgl-interactive')
    } else {
      map.dragPan.disable()
      map.scrollZoom.disable()
      map.doubleClickZoom.disable()
      map.touchZoomRotate.disable()
      map.touchPitch.disable()
      map.keyboard.disable()
      interactiveClassTarget.classList.remove('mapboxgl-interactive')
    }

    if (gamePhase === 'start') {
      map.jumpTo(START_VIEW)
    } else {
      map.easeTo({
        ...GAMEPLAY_VIEW,
        duration: 900,
      })
    }
  }, [gamePhase])

  useEffect(() => {
    if (gamePhase !== 'start') {
      return
    }

    let frameId = 0
    let lastTime = performance.now()

    const animateWorld = (time: number) => {
      const map = mapRef.current?.getMap()
      if (map) {
        const delta = Math.min(64, time - lastTime)
        map.setBearing((map.getBearing() + delta * 0.0016) % 360)
        lastTime = time
      }

      frameId = window.requestAnimationFrame(animateWorld)
    }

    frameId = window.requestAnimationFrame(animateWorld)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [gamePhase])

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={GAMEPLAY_VIEW}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      projection={{ name: 'globe' }}
      fog={{
        range: [0.8, 8],
        color: '#0a0a1a',
        'horizon-blend': 0.1,
        'high-color': '#1a1a3a',
        'space-color': '#050510',
        'star-intensity': 0.6,
      }}
      terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
    >
      {showGameplayMarkers && <NavigationControl position="top-right" />}

      {showGameplayMarkers && CITIES.map((city) => {
        const localFarmCount = localBuildings.filter((building) => building.cityId === city.id).length
        const totalFarmCount = allBuildings.filter((building) => building.cityId === city.id).length
        const hasLocalFarm = localCityIds.includes(city.id)

        return (
          <Marker
            key={city.id}
            longitude={city.lng}
            latitude={city.lat}
            anchor="center"
            onClick={(event) => {
              event.originalEvent.stopPropagation()
              handleCityClick(city)
            }}
          >
            <div
              className={`
                flex items-center justify-center rounded-full cursor-pointer transition-all
                ${
                  hasLocalFarm
                    ? 'w-10 h-10 bg-dark-card border-2 border-neon-cyan'
                    : 'w-7 h-7 bg-dark-card border border-dark-border hover:border-neon-cyan hover:scale-110'
                }
              `}
              title={city.name}
            >
              {hasLocalFarm ? (
                <span className="text-xs font-bold text-neon-cyan">{localFarmCount}</span>
              ) : totalFarmCount > 0 ? (
                <span className="text-[10px] text-neon-magenta">{totalFarmCount}</span>
              ) : (
                <span className="text-[10px] text-gray-400">📍</span>
              )}
            </div>
          </Marker>
        )
      })}

      {showGameplayMarkers && allBuildings.map((farm: ServerFarm) => (
        <Marker
          key={farm.id}
          longitude={farm.lng}
          latitude={farm.lat}
          anchor="center"
        >
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center rival-marker"
            style={{
              borderColor: farm.ownerColor ?? '#ffffff',
              backgroundColor: `${farm.ownerColor ?? '#ffffff'}22`,
            }}
            title={`${farm.ownerName ?? 'Unknown CEO'}'s farm`}
          >
            <span className="text-[8px]">⚡</span>
          </div>
        </Marker>
      ))}

      {showGameplayMarkers && selectedCity && (
        <Popup
          longitude={selectedCity.lng}
          latitude={selectedCity.lat}
          anchor="bottom"
          onClose={() => setSelectedCity(null)}
          closeOnClick={false}
          className="farm-popup"
        >
          <div className="bg-dark-panel text-white p-3 rounded-lg min-w-[220px] font-mono">
            <h3 className="text-neon-cyan font-bold text-sm mb-1">{selectedCity.name}</h3>
            <p className="text-[11px] text-gray-400 mb-2">
              Compute bonus: {selectedCity.computeBonus}x | Cost: {GAME_CONFIG.SERVER_FARM_COST} VC
            </p>
            <p className="text-[10px] text-gray-500 mb-3">
              Live farms here:{' '}
              {allBuildings.filter((building) => building.cityId === selectedCity.id).length}
            </p>
            <button
              onClick={handlePlaceFarm}
              disabled={!canAfford || alreadyBuiltHere}
              className={`
                w-full py-1.5 px-3 rounded text-xs font-bold transition-all
                ${
                  canAfford && !alreadyBuiltHere
                    ? 'bg-neon-cyan text-dark-bg hover:brightness-110 cursor-pointer'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {alreadyBuiltHere
                ? '✅ YOU ALREADY OWN THIS CITY'
                : canAfford
                  ? '🏗️ BUILD SERVER FARM'
                  : '❌ NOT ENOUGH VC FUNDING'}
            </button>
          </div>
        </Popup>
      )}
    </Map>
  )
}
