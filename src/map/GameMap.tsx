import { useEffect, useRef } from 'react'
import Map, { type MapRef } from 'react-map-gl/mapbox'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

const AMBIENT_VIEW = {
  longitude: 10,
  latitude: 18,
  zoom: 1.65,
  pitch: 14,
  bearing: 0,
} as const

export default function GameMap() {
  const mapRef = useRef<MapRef | null>(null)

  useEffect(() => {
    const map = mapRef.current?.getMap()
    if (!map) {
      return
    }

    map.dragPan.disable()
    map.scrollZoom.disable()
    map.doubleClickZoom.disable()
    map.touchZoomRotate.disable()
    map.touchPitch.disable()
    map.keyboard.disable()
    map.boxZoom.disable()
    map.dragRotate.disable()
    map.getCanvasContainer().classList.remove('mapboxgl-interactive')

    map.jumpTo(AMBIENT_VIEW)

    let frameId = 0
    let lastTime = performance.now()

    const animateWorld = (time: number) => {
      const target = mapRef.current?.getMap()
      if (target) {
        const delta = Math.min(64, time - lastTime)
        target.setBearing((target.getBearing() + delta * 0.0016) % 360)
        lastTime = time
      }
      frameId = window.requestAnimationFrame(animateWorld)
    }

    frameId = window.requestAnimationFrame(animateWorld)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  if (!MAPBOX_TOKEN) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(80,80,160,0.25)_0%,rgba(10,10,20,0.95)_60%)]"
      />
    )
  }

  return (
    <div className="absolute inset-0 pointer-events-none opacity-80">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={AMBIENT_VIEW}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        projection={{ name: 'globe' }}
        interactive={false}
        attributionControl={false}
        fog={{
          range: [0.8, 8],
          color: '#0a0a1a',
          'horizon-blend': 0.1,
          'high-color': '#1a1a3a',
          'space-color': '#050510',
          'star-intensity': 0.6,
        }}
      />
    </div>
  )
}
