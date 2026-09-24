/**
 * GPS Precision Engine: Filtering, Road-Snapping, Sensor Fusion & Compass Tracking
 */

// Convert degrees to radians
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Convert radians to degrees
function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// Haversine distance in meters
export function computeDistanceMeters(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) *
      Math.cos(toRad(p2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Compute forward azimuth/bearing in degrees [0..360)
export function computeBearing(
  start: { lat: number; lng: number },
  dest: { lat: number; lng: number }
): number {
  const startLat = toRad(start.lat);
  const startLng = toRad(start.lng);
  const destLat = toRad(dest.lat);
  const destLng = toRad(dest.lng);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

/**
 * Snap a GPS coordinate to the closest line segment on a route path.
 * If the cross-track distance is within maxSnapMeters, projects perpendicularly onto the segment.
 */
export function snapToRoute(
  point: { lat: number; lng: number },
  path: { lat: number; lng: number }[],
  maxSnapMeters: number = 16
): {
  coords: { lat: number; lng: number };
  isSnapped: boolean;
  distanceToPath: number;
} {
  if (!path || path.length < 2) {
    return { coords: point, isSnapped: false, distanceToPath: 0 };
  }

  let minDistance = Infinity;
  let closestPoint: { lat: number; lng: number } = point;

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];

    // Project point onto line segment [a, b] in Cartesian approximation
    const latMean = (a.lat + b.lat) / 2;
    const cosLat = Math.cos(toRad(latMean));

    // Meter scale approximation around local coordinate
    const dx = (b.lng - a.lng) * cosLat * 111320;
    const dy = (b.lat - a.lat) * 110540;
    const segLengthSq = dx * dx + dy * dy;

    let projLat = a.lat;
    let projLng = a.lng;

    if (segLengthSq > 0.000001) {
      const px = (point.lng - a.lng) * cosLat * 111320;
      const py = (point.lat - a.lat) * 110540;
      const t = Math.max(0, Math.min(1, (px * dx + py * dy) / segLengthSq));

      projLat = a.lat + t * (b.lat - a.lat);
      projLng = a.lng + t * (b.lng - a.lng);
    }

    const dist = computeDistanceMeters(point, { lat: projLat, lng: projLng });
    if (dist < minDistance) {
      minDistance = dist;
      closestPoint = { lat: projLat, lng: projLng };
    }
  }

  if (minDistance <= maxSnapMeters) {
    return {
      coords: closestPoint,
      isSnapped: true,
      distanceToPath: minDistance,
    };
  }

  return {
    coords: point,
    isSnapped: false,
    distanceToPath: minDistance,
  };
}

/**
 * Adaptive Exponential Moving Average (EMA) low-pass filter for GPS noise cancellation.
 * Prevents jitter when stationary, while preserving responsiveness during movement.
 */
export function smoothCoordinates(
  newCoords: { lat: number; lng: number },
  prevCoords: { lat: number; lng: number } | null,
  accuracyMeters: number | null
): { lat: number; lng: number } {
  if (!prevCoords) return newCoords;

  const dist = computeDistanceMeters(newCoords, prevCoords);

  // If drift is tiny (< 0.9 meter), lock in place to eliminate stationary jitter
  if (dist < 0.9) {
    return prevCoords;
  }

  // If impossible jump (> 150m in one tick), smooth heavily unless confirmed
  if (dist > 150) {
    return newCoords; // Accept large repositioning/warp
  }

  // Adaptive smoothing factor based on accuracy
  // Better accuracy -> higher alpha (trust new fix more)
  // Poor accuracy -> lower alpha (rely more on previous smoothed estimate)
  const acc = accuracyMeters ?? 15;
  let alpha = 0.55;
  if (acc <= 5) {
    alpha = 0.75;
  } else if (acc <= 12) {
    alpha = 0.55;
  } else if (acc <= 30) {
    alpha = 0.35;
  } else {
    alpha = 0.20;
  }

  return {
    lat: prevCoords.lat + alpha * (newCoords.lat - prevCoords.lat),
    lng: prevCoords.lng + alpha * (newCoords.lng - prevCoords.lng),
  };
}

/**
 * Smooth angle interpolation across the 360/0 degree singularity.
 */
export function smoothHeading(
  newHeading: number | null,
  prevHeading: number | null,
  factor: number = 0.4
): number | null {
  if (newHeading === null) return prevHeading;
  if (prevHeading === null) return newHeading;

  let diff = (newHeading - prevHeading + 180) % 360 - 180;
  if (diff < -180) diff += 360;

  // Tiny tremor filter (< 1.5 degree change ignored)
  if (Math.abs(diff) < 1.5) return prevHeading;

  const smoothed = (prevHeading + diff * factor + 360) % 360;
  return smoothed;
}

/**
 * Extract magnetic compass heading from device orientation event
 */
export function extractDeviceCompassHeading(event: DeviceOrientationEvent): number | null {
  // iOS Safari provides webkitCompassHeading directly relative to magnetic north
  if ('webkitCompassHeading' in event && typeof (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
    const heading = (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
    if (!isNaN(heading) && heading >= 0) {
      return heading;
    }
  }

  // Android Chrome / Standard provides alpha (counter-clockwise degrees relative to north or arbitrary frame)
  if (event.alpha !== null && !isNaN(event.alpha)) {
    // If absolute orientation is available
    if (event.absolute || ('absolute' in event && event.absolute)) {
      const heading = (360 - event.alpha) % 360;
      return heading;
    }
    // Fallback relative orientation
    return (360 - event.alpha) % 360;
  }

  return null;
}
