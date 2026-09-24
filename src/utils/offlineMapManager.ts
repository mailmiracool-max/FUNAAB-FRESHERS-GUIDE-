import { CampusLocation } from '../types/campus';
import { CAMPUS_LOCATIONS } from '../data/campusLocations';
import { CAMPUS_ROAD_NODES } from './navigationEngine';

export interface CampusRegion {
  id: string;
  name: string;
  tagline: string;
  buildingIds: string[];
  estimatedSizeMB: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  highlightColor: string;
}

export interface CachedRegionMeta {
  regionId: string;
  savedAt: string;
  sizeBytes: number;
  version: string;
}

export const CAMPUS_REGIONS: CampusRegion[] = [
  {
    id: 'south_entry',
    name: 'Main Gate & Ceremonial Precinct',
    tagline: 'School Gate, Ceremonial Building, Chapel, Mosque, FUNIS & Zoo',
    buildingIds: ['sch_gate', 'ceremonial_building', 'church', 'mosque', 'funaab_zoo', 'funaab_int_sch'],
    estimatedSizeMB: 1.8,
    bounds: { north: 7.2210, south: 7.2150, east: 3.4450, west: 3.4330 },
    highlightColor: '#059669',
  },
  {
    id: 'central_commercial',
    name: 'Central Transport & Commercial Hub',
    tagline: 'Bus Park, Cafeteria Shops, Health Centre, Man O\' War, Bookshop & ICTREC',
    buildingIds: ['park', 'shops', 'health_center', 'man_o_war', 'book_shop', 'ictrec'],
    estimatedSizeMB: 2.2,
    bounds: { north: 7.2250, south: 7.2215, east: 3.4485, west: 3.4395 },
    highlightColor: '#D97706',
  },
  {
    id: 'admin_motion',
    name: 'Senate, Library & Motion Ground Core',
    tagline: 'Senate Building, \'Nimbe Adedipe Library, Motion Ground, ACAD & Sports Stadium',
    buildingIds: ['senate_build', 'nimbe_lib', 'motion_ground', 'acad', 'sport_center', 'unity_build'],
    estimatedSizeMB: 2.6,
    bounds: { north: 7.2295, south: 7.2210, east: 3.4510, west: 3.4435 },
    highlightColor: '#1E3A8A',
  },
  {
    id: 'north_academic',
    name: 'Northern Ridge: COLENG & Hostels',
    tagline: 'College of Engineering, AUD 3, COLAMRUD, AMREC, MP, UK & IYAT Hostels',
    buildingIds: ['coleng', 'aud_3', 'colamrud', 'amrec', 'mp', 'uk_hostel', 'iyat'],
    estimatedSizeMB: 2.8,
    bounds: { north: 7.2385, south: 7.2290, east: 3.4485, west: 3.4400 },
    highlightColor: '#4F46E5',
  },
  {
    id: 'west_theatres',
    name: 'Western Theatres & Labs Complex',
    tagline: '1K CAP, ALL LAB, 250 & 500 Seater, Mahmud, New COLPHY, NB 1 & NB 2',
    buildingIds: ['1k_cap', 'all_lab', '250_seater', 'new_colphy', '500_seater', 'nb_1', 'nb_2', 'mahmud'],
    estimatedSizeMB: 3.1,
    bounds: { north: 7.2275, south: 7.2225, east: 3.4395, west: 3.4295 },
    highlightColor: '#7C3AED',
  },
  {
    id: 'northwest_student',
    name: 'SUB, COLCOM & Student Hostels',
    tagline: 'SUB, SUG Building, CENTS, COLCOM, Old & New Needs Hostels (Male & Female)',
    buildingIds: ['sub', 'sug_build', 'cents', 'colcom', 'old_need_male', 'old_need_female', 'new_needs_male', 'new_needs_female'],
    estimatedSizeMB: 2.9,
    bounds: { north: 7.2330, south: 7.2275, east: 3.4375, west: 3.4315 },
    highlightColor: '#E11D48',
  },
  {
    id: 'northeast_research',
    name: 'Northeast Research & Vet Medicine',
    tagline: 'JAO 3-in-1, COLAMIM, PISAD, Agric Lab, COLERM, COPLANT, COLVET & Marble',
    buildingIds: ['jao', 'colamim', 'pisad', 'agric_lab', 'colerm_ph1', 'coplant', 'colvet', 'colends', 'wole_soy_lib', 'marble_hostel'],
    estimatedSizeMB: 3.4,
    bounds: { north: 7.2360, south: 7.2195, east: 3.4565, west: 3.4465 },
    highlightColor: '#0D9488',
  },
  {
    id: 'all_campus',
    name: 'Complete FUNAAB Campus (Full Offline Pack)',
    tagline: 'All 48+ buildings, full road graph, offline search, step-by-step turn guidance',
    buildingIds: CAMPUS_LOCATIONS.map((l) => l.id),
    estimatedSizeMB: 8.5,
    bounds: { north: 7.2400, south: 7.2140, east: 3.4580, west: 3.4290 },
    highlightColor: '#10B981',
  },
];

const STORAGE_KEY = 'funaab_offline_regions_v1';
const OFFLINE_DATA_PREFIX = 'funaab_offline_data_';

// Get all saved offline region metadata
export function getSavedRegionsMeta(): Record<string, CachedRegionMeta> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Error reading offline regions', e);
    return {};
  }
}

// Check if a specific region is cached
export function isRegionCached(regionId: string): boolean {
  const meta = getSavedRegionsMeta();
  return !!meta[regionId];
}

// Save a region's package for offline navigation
export async function saveRegionOffline(
  regionId: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  const region = CAMPUS_REGIONS.find((r) => r.id === regionId);
  if (!region) throw new Error('Region not found');

  // Simulate progressive caching of vector geometry, tiles, and routes
  const steps = [15, 40, 70, 90, 100];
  for (const p of steps) {
    if (onProgress) onProgress(p);
    await new Promise((r) => setTimeout(r, 120));
  }

  // Filter locations and road network nodes within this region
  const regionLocations = CAMPUS_LOCATIONS.filter((loc) =>
    region.buildingIds.includes(loc.id)
  );

  const regionData = {
    region,
    locations: regionLocations,
    roadNodes: CAMPUS_ROAD_NODES,
    cachedAt: new Date().toISOString(),
    version: '1.0.0',
  };

  try {
    // Store in localStorage & Cache API if supported
    const serialized = JSON.stringify(regionData);
    localStorage.setItem(`${OFFLINE_DATA_PREFIX}${regionId}`, serialized);

    const meta = getSavedRegionsMeta();
    meta[regionId] = {
      regionId,
      savedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      sizeBytes: serialized.length * 2,
      version: '1.0.0',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));

    // Also populate Cache Storage if available
    if ('caches' in window) {
      try {
        const cache = await caches.open('funaab-offline-maps');
        const response = new Response(serialized, {
          headers: { 'Content-Type': 'application/json' },
        });
        await cache.put(`/offline-region/${regionId}`, response);
      } catch (err) {
        console.warn('Cache API skipped', err);
      }
    }
  } catch (err) {
    console.error('Failed to cache region offline:', err);
    throw err;
  }
}

// Remove cached region
export async function removeRegionOffline(regionId: string): Promise<void> {
  try {
    localStorage.removeItem(`${OFFLINE_DATA_PREFIX}${regionId}`);
    const meta = getSavedRegionsMeta();
    delete meta[regionId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));

    if ('caches' in window) {
      try {
        const cache = await caches.open('funaab-offline-maps');
        await cache.delete(`/offline-region/${regionId}`);
      } catch {}
    }
  } catch (err) {
    console.error('Failed to delete offline cache:', err);
  }
}

// Clear all offline regions
export async function clearAllOfflineMaps(): Promise<void> {
  try {
    const meta = getSavedRegionsMeta();
    Object.keys(meta).forEach((id) => {
      localStorage.removeItem(`${OFFLINE_DATA_PREFIX}${id}`);
    });
    localStorage.removeItem(STORAGE_KEY);

    if ('caches' in window) {
      try {
        await caches.delete('funaab-offline-maps');
      } catch {}
    }
  } catch (err) {
    console.error('Failed to clear cache:', err);
  }
}

// Calculate total offline storage used
export function getTotalOfflineStorageUsedMB(): number {
  const meta = getSavedRegionsMeta();
  let totalBytes = 0;
  Object.values(meta).forEach((m) => {
    totalBytes += m.sizeBytes;
  });
  return Number((totalBytes / (1024 * 1024)).toFixed(2));
}

// Get offline locations fallback if network is down
export function getOfflineLocations(regionId?: string): CampusLocation[] {
  if (!regionId) return CAMPUS_LOCATIONS;
  try {
    const raw = localStorage.getItem(`${OFFLINE_DATA_PREFIX}${regionId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.locations || CAMPUS_LOCATIONS;
    }
  } catch {}
  return CAMPUS_LOCATIONS;
}
