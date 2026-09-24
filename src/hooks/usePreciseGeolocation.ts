import { useState, useEffect, useRef, useCallback } from 'react';
import { UserLocationState, CalculatedRoute } from '../types/campus';
import { CAMPUS_LOCATIONS } from '../data/campusLocations';
import {
  smoothCoordinates,
  smoothHeading,
  snapToRoute,
  extractDeviceCompassHeading,
  computeBearing,
  computeDistanceMeters,
} from '../utils/gpsPrecision';

// Default FUNAAB campus origin (School Gate)
export const FUNAAB_DEFAULT_GATE = { lat: 7.21820, lng: 3.44120 };

// Dedicated coordinates for NEEDS Hostel complex (centered around Old & New Needs Hostels)
export const FUNAAB_NEEDS_HOSTEL = { lat: 7.23080, lng: 3.43350 };

export interface CampusLocationPreset {
  id: string;
  name: string;
  fullName: string;
  coords: { lat: number; lng: number };
  icon: string;
  badge?: string;
  description?: string;
}

export const CAMPUS_LOCATION_PRESETS: CampusLocationPreset[] = [
  {
    id: 'needs_hostels',
    name: 'NEEDS Hostel',
    fullName: 'NEEDS Hostels Complex (Old & New Female/Male)',
    coords: { lat: 7.23080, lng: 3.43350 },
    icon: '🏨',
    badge: 'Popular',
    description: 'Western student residential quadrant near Mahmud and 500 Seater',
  },
  {
    id: 'sch_gate',
    name: 'School Gate',
    fullName: 'FUNAAB Main Entrance Gate',
    coords: { lat: 7.21820, lng: 3.44120 },
    icon: '🚪',
    description: 'Alabata Road main entrance, bus stop, and security plaza',
  },
  {
    id: 'motion_ground',
    name: 'Motion Ground / Senate',
    fullName: 'Motion Ground Quadrangle & Senate',
    coords: { lat: 7.22720, lng: 3.44550 },
    icon: '🏛️',
    description: 'Central campus social square and administrative building',
  },
  {
    id: '1k_cap',
    name: '1K CAP',
    fullName: '1,000 Capacity Amphitheatre',
    coords: { lat: 7.22340, lng: 3.43850 },
    icon: '🎓',
    description: 'Central lecture amphitheatre near Central Park',
  },
  {
    id: 'sub',
    name: 'SUB',
    fullName: 'Student Union Building & Arcade',
    coords: { lat: 7.22980, lng: 3.43680 },
    icon: '👥',
    description: 'Student union secretariat, cafeteria, and relaxation plaza',
  },
  {
    id: 'coleng',
    name: 'COLENG',
    fullName: 'College of Engineering',
    coords: { lat: 7.23400, lng: 3.44200 },
    icon: '⚙️',
    description: 'Northern crest engineering complex and laboratories',
  },
  {
    id: 'nimbe_lib',
    name: 'Nimbe Library',
    fullName: '\'Nimbe Adedipe Central Library',
    coords: { lat: 7.22810, lng: 3.44490 },
    icon: '📚',
    description: 'Central university library and e-learning center',
  },
  {
    id: 'uk_iyat',
    name: 'UK / IYAT Hostels',
    fullName: 'Umar Kabir & IYAT Hostels (North Ridge)',
    coords: { lat: 7.23730, lng: 3.44680 },
    icon: '🏘️',
    description: 'Northern crest undergraduate residential halls',
  },
];

// Helper to determine the nearest landmark on campus
export function getNearestCampusLandmark(coords: { lat: number; lng: number }): {
  name: string;
  fullName: string;
  distanceMeters: number;
} | null {
  if (!coords) return null;
  let best: { name: string; fullName: string; distanceMeters: number } | null = null;
  for (const loc of CAMPUS_LOCATIONS) {
    const d = computeDistanceMeters(coords, loc.coordinates);
    if (!best || d < best.distanceMeters) {
      best = { name: loc.name, fullName: loc.fullName, distanceMeters: Math.round(d) };
    }
  }
  return best;
}

export function usePreciseGeolocation(
  activeRoute: CalculatedRoute | null,
  isNavigating: boolean
) {
  const [userLocation, setUserLocation] = useState<UserLocationState>({
    coords: FUNAAB_DEFAULT_GATE,
    rawCoords: FUNAAB_DEFAULT_GATE,
    heading: 350,
    accuracy: 3.5,
    altitude: 185,
    speed: 0,
    isSimulated: true,
    active: true,
    error: null,
    lockStatus: 'searching',
    isSnapped: false,
    locationName: 'Detecting Location...',
  });

  const [recenterTimestamp, setRecenterTimestamp] = useState<number>(0);

  const watchIdRef = useRef<number | null>(null);
  const rawCoordsRef = useRef<{ lat: number; lng: number } | null>(FUNAAB_DEFAULT_GATE);
  const smoothedCoordsRef = useRef<{ lat: number; lng: number } | null>(FUNAAB_DEFAULT_GATE);
  const lastHeadingRef = useRef<number | null>(350);
  const simulationStepIndexRef = useRef<number>(0);

  // Recenter map trigger
  const triggerRecenter = useCallback(() => {
    setRecenterTimestamp(Date.now());
  }, []);

  // Set location manually (e.g. at NEEDS Hostel, School Gate, or any building)
  const setManualLocation = useCallback((coords: { lat: number; lng: number }, explicitName?: string) => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    rawCoordsRef.current = coords;
    smoothedCoordsRef.current = coords;

    const nearest = getNearestCampusLandmark(coords);
    const resolvedName = explicitName || (nearest ? nearest.name : 'Selected Location');

    setUserLocation({
      coords,
      rawCoords: coords,
      heading: 0,
      accuracy: 3.0,
      altitude: 185,
      speed: 0,
      isSimulated: true,
      active: true,
      error: null,
      lockStatus: 'locked',
      isSnapped: false,
      locationName: resolvedName,
    });

    setRecenterTimestamp(Date.now());
  }, []);

  // Update Compass Heading from Device Sensors
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const heading = extractDeviceCompassHeading(e);
      if (heading !== null) {
        const smoothed = smoothHeading(heading, lastHeadingRef.current, 0.45);
        lastHeadingRef.current = smoothed;

        setUserLocation((prev) => {
          if (prev.isSimulated && isNavigating) return prev;
          return {
            ...prev,
            heading: smoothed,
          };
        });
      }
    };

    const win = window as unknown as Window & { ondeviceorientationabsolute?: unknown };
    const hasAbsolute = 'ondeviceorientationabsolute' in win;
    const eventType = hasAbsolute ? 'deviceorientationabsolute' : 'deviceorientation';

    window.addEventListener(eventType, handleOrientation as unknown as EventListener, true);

    return () => {
      window.removeEventListener(eventType, handleOrientation as unknown as EventListener, true);
    };
  }, [isNavigating]);

  // Handle position update from device geolocation
  const handleGpsPosition = useCallback((pos: GeolocationPosition) => {
    const raw = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
    rawCoordsRef.current = raw;

    const accuracy = pos.coords.accuracy;
    const speed = pos.coords.speed;
    const altitude = pos.coords.altitude;
    const gpsHeading = pos.coords.heading;

    // 1. Noise Filter: Adaptive Exponential Moving Average
    const smoothed = smoothCoordinates(
      raw,
      smoothedCoordsRef.current,
      accuracy
    );
    smoothedCoordsRef.current = smoothed;

    // 2. Road Snapping: If actively navigating, snap to active route
    let displayCoords = smoothed;
    let isSnapped = false;
    if (isNavigating && activeRoute?.path && activeRoute.path.length > 1) {
      const snapped = snapToRoute(smoothed, activeRoute.path, 16);
      if (snapped.isSnapped) {
        displayCoords = snapped.coords;
        isSnapped = true;
      }
    }

    // 3. Heading selection
    let effectiveHeading = lastHeadingRef.current;
    if (gpsHeading !== null && !isNaN(gpsHeading) && (speed ?? 0) >= 0.8) {
      effectiveHeading = smoothHeading(gpsHeading, lastHeadingRef.current, 0.5);
      lastHeadingRef.current = effectiveHeading;
    }

    // Determine nearest landmark on campus for friendly label
    const nearest = getNearestCampusLandmark(displayCoords);
    let placeLabel = 'Device GPS (Active)';
    if (nearest) {
      if (nearest.distanceMeters <= 70) {
        placeLabel = `At ${nearest.name}`;
      } else if (nearest.distanceMeters <= 220) {
        placeLabel = `Near ${nearest.name} (~${nearest.distanceMeters}m)`;
      } else {
        placeLabel = `Campus (${nearest.distanceMeters}m to ${nearest.name})`;
      }
    }

    let lockStatus: 'searching' | 'locked' | 'high-precision' = 'locked';
    if (accuracy && accuracy <= 10) {
      lockStatus = 'high-precision';
    }

    setUserLocation({
      coords: displayCoords,
      rawCoords: raw,
      heading: effectiveHeading,
      accuracy: accuracy ? Math.round(accuracy * 10) / 10 : 5,
      altitude: altitude ? Math.round(altitude) : null,
      speed: speed ? Math.round(speed * 3.6 * 10) / 10 : 0,
      isSimulated: false,
      active: true,
      error: null,
      lockStatus,
      isSnapped,
      locationName: placeLabel,
    });
  }, [isNavigating, activeRoute]);

  // Real Hardware GPS Tracking with Low-Latency & Precision Filtering
  const startRealGeolocation = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setUserLocation((prev) => ({
        ...prev,
        error: 'Geolocation hardware is not available on this device.',
        isSimulated: true,
        lockStatus: 'simulated',
        locationName: prev.locationName || 'NEEDS Hostel (Simulated)',
      }));
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setUserLocation((prev) => ({
      ...prev,
      lockStatus: 'searching',
      error: null,
      locationName: 'Acquiring GPS fix...',
    }));

    // First request immediate position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleGpsPosition(pos);
        triggerRecenter();
      },
      (err) => {
        console.warn('Initial one-shot GPS error:', err.message);
        // Do not fail completely yet as watchPosition may still succeed or user can pick hostel
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    // Then start continuous high-precision watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        handleGpsPosition(pos);
      },
      (err) => {
        console.warn('High precision GPS watch error:', err.message);
        setUserLocation((prev) => {
          // If we had no real coords yet, preserve current coords but indicate error
          const nearest = prev.coords ? getNearestCampusLandmark(prev.coords) : null;
          return {
            ...prev,
            error: err.code === 1 
              ? 'Location permission denied in browser. Please enable GPS permissions or choose your location below.' 
              : err.message,
            lockStatus: 'simulated',
            locationName: prev.locationName && !prev.locationName.includes('Acquiring')
              ? prev.locationName
              : nearest 
              ? `${nearest.name} (Simulated)` 
              : 'NEEDS Hostel (Preset)',
          };
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );
  }, [handleGpsPosition, triggerRecenter]);

  // Automatically attempt real GPS when hook mounts
  useEffect(() => {
    startRealGeolocation();
  }, [startRealGeolocation]);

  // Toggle between Real Device GPS and Campus Simulation
  const toggleSimulateLocation = useCallback(() => {
    if (userLocation.isSimulated) {
      startRealGeolocation();
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      // If user toggles to simulation, default to NEEDS Hostel or School Gate
      const fallbackPreset = FUNAAB_NEEDS_HOSTEL;
      smoothedCoordsRef.current = fallbackPreset;
      rawCoordsRef.current = fallbackPreset;
      setUserLocation({
        coords: fallbackPreset,
        rawCoords: fallbackPreset,
        heading: 350,
        accuracy: 3.5,
        altitude: 185,
        speed: 0,
        isSimulated: true,
        active: true,
        error: null,
        lockStatus: 'simulated',
        isSnapped: false,
        locationName: 'NEEDS Hostel (Simulated)',
      });
      triggerRecenter();
    }
  }, [userLocation.isSimulated, startRealGeolocation, triggerRecenter]);

  // Reset simulation step on route change
  useEffect(() => {
    simulationStepIndexRef.current = 0;
  }, [activeRoute]);

  // Realistic Campus Simulation Movement along Route Path
  useEffect(() => {
    if (!isNavigating || !userLocation.isSimulated || !activeRoute) return;

    const path = activeRoute.path;
    if (!path || path.length < 2) return;

    const timer = setInterval(() => {
      setUserLocation((prev) => {
        if (!prev.coords) return prev;

        const currentPos = prev.coords;
        let targetIdx = simulationStepIndexRef.current;

        if (targetIdx >= path.length) {
          return {
            ...prev,
            speed: 0,
          };
        }

        const targetPoint = path[targetIdx];
        const distToTarget = computeDistanceMeters(currentPos, targetPoint);

        if (distToTarget < 6 && targetIdx < path.length - 1) {
          simulationStepIndexRef.current += 1;
        }

        const nextPoint = path[simulationStepIndexRef.current];
        const distRemaining = computeDistanceMeters(currentPos, nextPoint);

        if (distRemaining < 1.5) {
          return {
            ...prev,
            coords: nextPoint,
            speed: 0,
          };
        }

        const stepRatio = Math.min(1, 7.5 / distRemaining);
        const nextLat = currentPos.lat + stepRatio * (nextPoint.lat - currentPos.lat);
        const nextLng = currentPos.lng + stepRatio * (nextPoint.lng - currentPos.lng);

        const newCoords = { lat: nextLat, lng: nextLng };
        const calculatedHeading = computeBearing(currentPos, nextPoint);

        return {
          ...prev,
          coords: newCoords,
          rawCoords: newCoords,
          heading: calculatedHeading,
          speed: 4.8,
          accuracy: 3.0,
          isSnapped: true,
          lockStatus: 'simulated',
        };
      });
    }, 1400);

    return () => clearInterval(timer);
  }, [isNavigating, userLocation.isSimulated, activeRoute]);

  // Clean up GPS watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    userLocation,
    setUserLocation,
    startRealGeolocation,
    setManualLocation,
    toggleSimulateLocation,
    triggerRecenter,
    recenterTimestamp,
  };
}
