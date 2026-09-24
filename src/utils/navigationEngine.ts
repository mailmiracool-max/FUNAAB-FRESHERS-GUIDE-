import { CalculatedRoute, RouteStep, TravelMode } from '../types/campus';

// Campus Road Graph Nodes for realistic intra-campus pathfinding
interface CampusNode {
  id: string;
  lat: number;
  lng: number;
  name: string;
  connections: string[];
}

export const CAMPUS_ROAD_NODES: Record<string, CampusNode> = {
  sch_gate_node: {
    id: 'sch_gate_node',
    lat: 7.21820,
    lng: 3.44120,
    name: 'School Gate Avenue',
    connections: ['ceremonial_junction', 'worship_junction', 'zoo_branch'],
  },
  zoo_branch: {
    id: 'zoo_branch',
    lat: 7.21700,
    lng: 3.43600,
    name: 'Zoo & FUNIS Road',
    connections: ['sch_gate_node'],
  },
  ceremonial_junction: {
    id: 'ceremonial_junction',
    lat: 7.21980,
    lng: 3.44350,
    name: 'Ceremonial Way',
    connections: ['sch_gate_node', 'worship_junction', 'east_corridor_junction'],
  },
  worship_junction: {
    id: 'worship_junction',
    lat: 7.22050,
    lng: 3.44150,
    name: 'Chapel & Mosque Junction',
    connections: ['sch_gate_node', 'ceremonial_junction', 'central_park_roundabout'],
  },
  central_park_roundabout: {
    id: 'central_park_roundabout',
    lat: 7.22380,
    lng: 3.44250,
    name: 'Central Park Roundabout',
    connections: ['worship_junction', 'west_artery_junction', 'east_corridor_junction', 'spine_annenih_junction'],
  },
  east_corridor_junction: {
    id: 'east_corridor_junction',
    lat: 7.22360,
    lng: 3.44700,
    name: 'ICTREC & Unity Junction',
    connections: ['central_park_roundabout', 'ceremonial_junction', 'colends_branch', 'senate_junction'],
  },
  colends_branch: {
    id: 'colends_branch',
    lat: 7.22150,
    lng: 3.45300,
    name: 'COLENDS & Marble Avenue',
    connections: ['east_corridor_junction', 'colvet_junction'],
  },
  west_artery_junction: {
    id: 'west_artery_junction',
    lat: 7.22370,
    lng: 3.43850,
    name: '1K CAP Roundabout',
    connections: ['central_park_roundabout', 'far_west_theatre_node', 'sub_curve_junction'],
  },
  far_west_theatre_node: {
    id: 'far_west_theatre_node',
    lat: 7.22450,
    lng: 3.43200,
    name: 'Mahmud & 500 Seater Concourse',
    connections: ['west_artery_junction', 'hostel_ring_node'],
  },
  hostel_ring_node: {
    id: 'hostel_ring_node',
    lat: 7.23050,
    lng: 3.43350,
    name: 'Needs Hostels Crescent',
    connections: ['far_west_theatre_node', 'sub_curve_junction'],
  },
  sub_curve_junction: {
    id: 'sub_curve_junction',
    lat: 7.22950,
    lng: 3.43650,
    name: 'SUB & COLCOM Boulevard',
    connections: ['west_artery_junction', 'hostel_ring_node', 'north_spine_mid'],
  },
  spine_annenih_junction: {
    id: 'spine_annenih_junction',
    lat: 7.22650,
    lng: 3.44200,
    name: 'Anenih & COLBIOS Circle',
    connections: ['central_park_roundabout', 'motion_ground_node', 'north_spine_mid'],
  },
  motion_ground_node: {
    id: 'motion_ground_node',
    lat: 7.22720,
    lng: 3.44550,
    name: 'Motion Ground Promenade',
    connections: ['spine_annenih_junction', 'senate_junction', 'nimbe_library_node'],
  },
  nimbe_library_node: {
    id: 'nimbe_library_node',
    lat: 7.22810,
    lng: 3.44490,
    name: '\'Nimbe Library Plaza',
    connections: ['motion_ground_node', 'north_spine_mid', 'north_coleng_junction', 'jao_branch_node'],
  },
  senate_junction: {
    id: 'senate_junction',
    lat: 7.22780,
    lng: 3.44750,
    name: 'Senate Complex Boulevard',
    connections: ['motion_ground_node', 'east_corridor_junction', 'colvet_junction', 'jao_branch_node'],
  },
  colvet_junction: {
    id: 'colvet_junction',
    lat: 7.22680,
    lng: 3.45380,
    name: 'COLVET & COPLANT Crescent',
    connections: ['colends_branch', 'senate_junction', 'jao_branch_node'],
  },
  north_spine_mid: {
    id: 'north_spine_mid',
    lat: 7.23050,
    lng: 3.44150,
    name: 'COLAMRUD & MP Drive',
    connections: ['sub_curve_junction', 'spine_annenih_junction', 'nimbe_library_node', 'north_coleng_junction'],
  },
  north_coleng_junction: {
    id: 'north_coleng_junction',
    lat: 7.23420,
    lng: 3.44300,
    name: 'COLENG & AUD 3 Roundabout',
    connections: ['north_spine_mid', 'nimbe_library_node', 'uk_hostel_crest', 'agric_lab_node'],
  },
  agric_lab_node: {
    id: 'agric_lab_node',
    lat: 7.23380,
    lng: 3.44900,
    name: 'COLERM & Agric Lab Drive',
    connections: ['north_coleng_junction', 'jao_branch_node'],
  },
  jao_branch_node: {
    id: 'jao_branch_node',
    lat: 7.23080,
    lng: 3.45050,
    name: 'JAO & COLAMIM Loop',
    connections: ['senate_junction', 'nimbe_library_node', 'agric_lab_node', 'colvet_junction'],
  },
  uk_hostel_crest: {
    id: 'uk_hostel_crest',
    lat: 7.23700,
    lng: 3.44700,
    name: 'UK & IYAT Hostels Ridge',
    connections: ['north_coleng_junction'],
  },
};

// Haversine distance in meters
export function getDistanceMeters(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (coord1.lat * Math.PI) / 180;
  const phi2 = (coord2.lat * Math.PI) / 180;
  const deltaPhi = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLambda = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Calculate bearing/heading in degrees (0 = North, 90 = East, 180 = South, 270 = West)
export function getBearingDegrees(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const y = Math.sin(((to.lng - from.lng) * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180);
  const x =
    Math.cos((from.lat * Math.PI) / 180) * Math.sin((to.lat * Math.PI) / 180) -
    Math.sin((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.cos(((to.lng - from.lng) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 1) return '< 1 min';
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs} hr ${remainingMins} min`;
  }
  return `${mins} min`;
}

// Find closest campus network node to a given point
function findClosestNode(point: { lat: number; lng: number }): CampusNode {
  let closest: CampusNode = CAMPUS_ROAD_NODES['central_park_roundabout'];
  let minDistance = Infinity;

  Object.values(CAMPUS_ROAD_NODES).forEach((node) => {
    const dist = getDistanceMeters(point, { lat: node.lat, lng: node.lng });
    if (dist < minDistance) {
      minDistance = dist;
      closest = node;
    }
  });

  return closest;
}

// Dijkstra pathfinding on the FUNAAB campus graph
function findPathOnGraph(startNodeId: string, endNodeId: string): CampusNode[] {
  if (startNodeId === endNodeId) {
    return [CAMPUS_ROAD_NODES[startNodeId]];
  }

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  Object.keys(CAMPUS_ROAD_NODES).forEach((nodeId) => {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  });

  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let currentId: string | null = null;
    let shortestDist = Infinity;

    unvisited.forEach((nodeId) => {
      if (distances[nodeId] < shortestDist) {
        shortestDist = distances[nodeId];
        currentId = nodeId;
      }
    });

    if (!currentId || shortestDist === Infinity) break;
    if (currentId === endNodeId) break;

    unvisited.delete(currentId);
    const currentNode = CAMPUS_ROAD_NODES[currentId];

    currentNode.connections.forEach((neighborId) => {
      if (!unvisited.has(neighborId)) return;
      const neighborNode = CAMPUS_ROAD_NODES[neighborId];
      if (!neighborNode) return;

      const edgeWeight = getDistanceMeters(
        { lat: currentNode.lat, lng: currentNode.lng },
        { lat: neighborNode.lat, lng: neighborNode.lng }
      );
      const alt = distances[currentId!] + edgeWeight;

      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = currentId;
      }
    });
  }

  // Reconstruct path
  const path: CampusNode[] = [];
  let curr: string | null = endNodeId;
  while (curr) {
    path.unshift(CAMPUS_ROAD_NODES[curr]);
    curr = previous[curr];
  }

  return path;
}

// Generate human-friendly turn-by-turn guidance
export function calculateCampusRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  originName: string,
  destinationName: string,
  mode: TravelMode = 'WALKING'
): CalculatedRoute {
  const directDistance = getDistanceMeters(origin, destination);

  // If very close (< 80 meters), direct straight walk
  if (directDistance < 80) {
    const durationSecs = mode === 'WALKING' ? Math.round(directDistance / 1.25) : Math.round(directDistance / 6.0);
    return {
      originName,
      destinationName,
      originCoords: origin,
      destinationCoords: destination,
      distanceMeters: directDistance,
      durationSeconds: Math.max(durationSecs, 30),
      path: [origin, destination],
      steps: [
        {
          instruction: `Walk straight towards ${destinationName}`,
          distanceMeters: directDistance,
          maneuver: 'straight',
          coord: destination,
        },
        {
          instruction: `Arrive at ${destinationName}`,
          distanceMeters: 0,
          maneuver: 'arrive',
          coord: destination,
        },
      ],
      mode,
    };
  }

  const startNode = findClosestNode(origin);
  const endNode = findClosestNode(destination);

  const graphPath = findPathOnGraph(startNode.id, endNode.id);

  // Combine full path: origin -> startNode -> graph nodes -> endNode -> destination
  const fullCoordinates: { lat: number; lng: number }[] = [origin];
  graphPath.forEach((node) => {
    fullCoordinates.push({ lat: node.lat, lng: node.lng });
  });
  fullCoordinates.push(destination);

  // Calculate cumulative distance
  let totalDistance = 0;
  const steps: RouteStep[] = [];

  // Step 1: Head from origin to first junction
  const startLegDist = getDistanceMeters(origin, { lat: startNode.lat, lng: startNode.lng });
  totalDistance += startLegDist;
  steps.push({
    instruction: `Head from ${originName} towards ${startNode.name}`,
    distanceMeters: startLegDist,
    maneuver: 'straight',
    coord: { lat: startNode.lat, lng: startNode.lng },
  });

  // Step 2..N: Move along intermediate junctions
  for (let i = 0; i < graphPath.length - 1; i++) {
    const fromNode = graphPath[i];
    const toNode = graphPath[i + 1];
    const segDist = getDistanceMeters(
      { lat: fromNode.lat, lng: fromNode.lng },
      { lat: toNode.lat, lng: toNode.lng }
    );
    totalDistance += segDist;

    const bearing = getBearingDegrees(
      { lat: fromNode.lat, lng: fromNode.lng },
      { lat: toNode.lat, lng: toNode.lng }
    );

    let maneuver: RouteStep['maneuver'] = 'straight';
    let dirText = 'Continue';
    if (segDist > 10) {
      if (bearing >= 45 && bearing < 135) {
        dirText = 'Turn right onto';
        maneuver = 'turn-right';
      } else if (bearing >= 225 && bearing < 315) {
        dirText = 'Turn left onto';
        maneuver = 'turn-left';
      } else {
        dirText = 'Proceed along';
        maneuver = 'straight';
      }
    }

    steps.push({
      instruction: `${dirText} ${toNode.name}`,
      distanceMeters: segDist,
      maneuver,
      coord: { lat: toNode.lat, lng: toNode.lng },
    });
  }

  // Final step: approach destination from end node
  const endLegDist = getDistanceMeters({ lat: endNode.lat, lng: endNode.lng }, destination);
  totalDistance += endLegDist;
  steps.push({
    instruction: `Turn towards ${destinationName} entrance`,
    distanceMeters: endLegDist,
    maneuver: 'straight',
    coord: destination,
  });
  steps.push({
    instruction: `Arrive at ${destinationName}`,
    distanceMeters: 0,
    maneuver: 'arrive',
    coord: destination,
  });

  // Speed: Walking ~ 1.25 m/s (4.5 km/h), Driving ~ 6.5 m/s (~23 km/h on campus roads)
  const speed = mode === 'WALKING' ? 1.25 : 6.5;
  const durationSeconds = Math.round(totalDistance / speed);

  return {
    originName,
    destinationName,
    originCoords: origin,
    destinationCoords: destination,
    distanceMeters: totalDistance,
    durationSeconds,
    path: fullCoordinates,
    steps,
    mode,
  };
}

// Trigger physical haptic feedback if supported by device
export function triggerTurnHaptic(): boolean {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      // Gentle double pulse for upcoming turn maneuver
      return navigator.vibrate([80, 50, 80]);
    } catch {
      return false;
    }
  }
  return false;
}

// Gentle audio chime synthesizer using Web Audio API (no external asset needed)
let audioCtx: AudioContext | null = null;
export function playTurnChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    // Gentle dual-tone frequency transition (587 Hz = D5 -> 880 Hz = A5)
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.15);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch (err) {
    // Audio context may be restricted by autoplay policies before gesture
    console.debug('Turn chime skipped', err);
  }
}

// Request Notification permission
export async function requestTurnNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }
  return 'denied';
}

// Dispatch subtle browser turn notification
export function sendTurnNotification(
  instruction: string,
  distanceMeters: number
): void {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`Turn in ${distanceMeters}m`, {
        body: instruction,
        icon: '/icon.svg',
        tag: 'funaab-turn-alert',
        silent: true, // Don't clash with custom gentle chime
      });
    } catch (e) {
      console.debug('Notification could not be dispatched', e);
    }
  }
}

