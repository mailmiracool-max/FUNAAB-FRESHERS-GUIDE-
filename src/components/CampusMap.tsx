import React, { useEffect, useRef, useState } from 'react';
import { 
  Map, 
  AdvancedMarker, 
  useMap, 
  useMapsLibrary 
} from '@vis.gl/react-google-maps';
import { Calendar, Clock, Navigation, X, Radio, ArrowRight } from 'lucide-react';
import { CampusLocation, CalculatedRoute, UserLocationState, CampusEvent, StudyGroup } from '../types/campus';
import { CAMPUS_CENTER, CAMPUS_LOCATIONS, CATEGORY_INFO } from '../data/campusLocations';
import { CampusRegion } from '../utils/offlineMapManager';
import { EVENT_CATEGORY_CONFIG } from '../data/campusEvents';

interface CampusMapProps {
  locations: CampusLocation[];
  selectedLocation: CampusLocation | null;
  onSelectLocation: (loc: CampusLocation) => void;
  activeRoute: CalculatedRoute | null;
  userLocation: UserLocationState;
  mapType: string;
  isNavigating: boolean;
  highlightedRegion?: CampusRegion | null;
  isOfflineMode?: boolean;
  isApproachingTurn?: boolean;
  approachingTurnCoord?: { lat: number; lng: number } | null;
  recenterTimestamp?: number;
  events?: CampusEvent[];
  showEventsOverlay?: boolean;
  selectedEvent?: CampusEvent | null;
  onSelectEvent?: (event: CampusEvent | null) => void;
  onNavigateToEvent?: (event: CampusEvent) => void;
  onOpenLocationCalibrator?: () => void;
  studyGroups?: StudyGroup[];
  showStudyGroupsOnMap?: boolean;
}

// Controller component to smoothly pan and zoom the map
function MapController({
  targetCoords,
  zoom,
}: {
  targetCoords: { lat: number; lng: number } | null;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !targetCoords) return;
    map.panTo(targetCoords);
    if (zoom) {
      map.setZoom(zoom);
    }
  }, [map, targetCoords, zoom]);

  return null;
}

// Dedicated Handler to pan directly to user when recenter button is clicked
function RecenterHandler({
  recenterTimestamp,
  coords,
}: {
  recenterTimestamp?: number;
  coords: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !coords || !recenterTimestamp) return;
    map.panTo(coords);
    map.setZoom(18);
  }, [map, coords, recenterTimestamp]);

  return null;
}

// Dynamic Google Maps Accuracy Circle for physical precision margin
function UserAccuracyCircle({
  coords,
  accuracy,
}: {
  coords: { lat: number; lng: number } | null;
  accuracy: number | null;
}) {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    if (!coords || !window.google || !window.google.maps) return;

    // Radius clamped to reasonable display margins (2.5m to 45m)
    const radius = Math.max(2.5, Math.min(accuracy ?? 5, 45));

    const circle = new window.google.maps.Circle({
      center: coords,
      radius,
      fillColor: '#10B981',
      fillOpacity: 0.12,
      strokeColor: '#059669',
      strokeOpacity: 0.4,
      strokeWeight: 1.5,
      clickable: false,
      map,
    });

    circleRef.current = circle;

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
      }
    };
  }, [map, coords, accuracy]);

  return null;
}

// Region Bounds Highlight Renderer
function RegionBoundsRenderer({ region }: { region: CampusRegion | null | undefined }) {
  const map = useMap();
  const rectangleRef = useRef<google.maps.Rectangle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (rectangleRef.current) {
      rectangleRef.current.setMap(null);
      rectangleRef.current = null;
    }

    if (!region) return;

    if (window.google && window.google.maps) {
      const bounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(region.bounds.south, region.bounds.west),
        new window.google.maps.LatLng(region.bounds.north, region.bounds.east)
      );

      const rect = new window.google.maps.Rectangle({
        bounds,
        strokeColor: region.highlightColor || '#10B981',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        fillColor: region.highlightColor || '#10B981',
        fillOpacity: 0.15,
        map,
      });

      rectangleRef.current = rect;
      map.fitBounds(bounds, 50);
    }

    return () => {
      if (rectangleRef.current) {
        rectangleRef.current.setMap(null);
      }
    };
  }, [map, region]);

  return null;
}

// Route Polyline Renderer
function RoutePolyline({ route }: { route: CalculatedRoute | null }) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    // Clean up previous polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!route || !route.path || route.path.length < 2) return;

    if (window.google && window.google.maps) {
      const poly = new window.google.maps.Polyline({
        path: route.path,
        geodesic: true,
        strokeColor: '#10B981', // FUNAAB Green
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map: map,
      });

      polylineRef.current = poly;

      // Fit bounds to show entire route with padding
      const bounds = new window.google.maps.LatLngBounds();
      route.path.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, 60);
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, route]);

  return null;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  activeRoute,
  userLocation,
  mapType,
  isNavigating,
  highlightedRegion,
  isOfflineMode,
  isApproachingTurn,
  approachingTurnCoord,
  recenterTimestamp,
  events = [],
  showEventsOverlay = true,
  selectedEvent = null,
  onSelectEvent,
  onNavigateToEvent,
  onOpenLocationCalibrator,
  studyGroups = [],
  showStudyGroupsOnMap = true,
}) => {
  const [mapZoom, setMapZoom] = useState(15.5);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <Map
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
        defaultCenter={CAMPUS_CENTER}
        defaultZoom={15.5}
        mapTypeId={mapType}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
      >
        {/* Route Polyline */}
        <RoutePolyline route={activeRoute} />

        {/* Region Bounds Highlight */}
        <RegionBoundsRenderer region={highlightedRegion} />

        {/* Physical GPS Accuracy Halo */}
        <UserAccuracyCircle
          coords={userLocation.coords}
          accuracy={userLocation.accuracy}
        />

        {/* Recenter Pan Handler */}
        <RecenterHandler
          recenterTimestamp={recenterTimestamp}
          coords={userLocation.coords}
        />

        {/* Pan Controller when a location is selected */}
        {selectedLocation && !selectedEvent && (
          <MapController
            targetCoords={selectedLocation.coordinates}
            zoom={17.5}
          />
        )}

        {/* Pan Controller when an event is selected */}
        {selectedEvent && !isNavigating && (
          <MapController
            targetCoords={selectedEvent.coordinates}
            zoom={18}
          />
        )}

        {/* Pan Controller when live navigating */}
        {isNavigating && userLocation.coords && (
          <MapController
            targetCoords={userLocation.coords}
            zoom={18}
          />
        )}

        {/* Render Device / User High-Precision Location Beacon */}
        {userLocation.coords && (
          <AdvancedMarker
            position={userLocation.coords}
            title={
              userLocation.isSimulated
                ? 'Campus High-Precision Simulation'
                : `Live GPS Fix (±${userLocation.accuracy ?? 3}m precision)`
            }
          >
            <div className="relative flex items-center justify-center pointer-events-none">
              {/* Directional Precision Field-of-View Cone Beam */}
              {userLocation.heading !== null && (
                <div
                  className="absolute pointer-events-none transition-transform duration-300 ease-out"
                  style={{
                    transform: `rotate(${userLocation.heading}deg)`,
                    top: '-42px',
                    left: '-32px',
                    width: '64px',
                    height: '52px',
                  }}
                >
                  <svg width="64" height="52" viewBox="0 0 64 52" fill="none" className="overflow-visible">
                    <defs>
                      <radialGradient id="compassBeamGrad" cx="50%" cy="100%" r="85%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="#34d399" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <polygon points="32,52 6,0 58,0" fill="url(#compassBeamGrad)" />
                  </svg>
                </div>
              )}

              {/* Concentric Signal Radar Pulse */}
              <span className="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-emerald-400 opacity-60"></span>

              {/* Outer Precision Ring */}
              <div className="absolute w-8 h-8 rounded-full border border-emerald-400/60 bg-emerald-500/10"></div>

              {/* Core Beacon with High-Contrast White Rim and Center Dot */}
              <div className="relative w-5 h-5 rounded-full bg-emerald-600 border-[2.5px] border-white shadow-xl flex items-center justify-center ring-2 ring-emerald-500/50">
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>
              </div>

              {/* Precision Heading Pointer Tip */}
              {userLocation.heading !== null && (
                <div
                  className="absolute w-full h-full flex items-center justify-center transition-transform duration-300 ease-out pointer-events-none"
                  style={{ transform: `rotate(${userLocation.heading}deg)` }}
                >
                  <div className="absolute -top-3 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[7px] border-b-emerald-800 filter drop-shadow(0 1px 1px rgba(0,0,0,0.4))" />
                </div>
              )}

              {/* Clickable Location Badge Tag */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLocationCalibrator?.();
                }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xl border border-emerald-400/50 pointer-events-auto cursor-pointer hover:bg-emerald-900 transition flex items-center gap-1.5 z-10"
                title="Tap to fix your location or calibrate GPS"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="max-w-[140px] truncate">{userLocation.locationName || 'You are here'}</span>
                <span className="text-[9px] text-amber-300 underline underline-offset-1">Fix</span>
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* Approaching Turn Pulsing Radar Beacon on Map */}
        {isApproachingTurn && approachingTurnCoord && (
          <AdvancedMarker position={approachingTurnCoord} title="Upcoming Turn Junction">
            <div className="relative flex items-center justify-center pointer-events-none">
              <span className="animate-ping absolute inline-flex h-14 w-14 rounded-full bg-amber-400 opacity-80"></span>
              <span className="animate-pulse absolute inline-flex h-9 w-9 rounded-full bg-amber-500 opacity-60"></span>
              <div className="relative w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-2xl flex items-center justify-center text-slate-950 font-black text-xs">
                ⚡
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* Render Campus Location Pins */}
        {locations.map((loc) => {
          const isSelected = selectedLocation?.id === loc.id;
          const isOrigin = activeRoute?.originCoords.lat === loc.coordinates.lat && activeRoute?.originCoords.lng === loc.coordinates.lng;
          const isDest = activeRoute?.destinationCoords.lat === loc.coordinates.lat && activeRoute?.destinationCoords.lng === loc.coordinates.lng;

          return (
            <AdvancedMarker
              key={loc.id}
              position={loc.coordinates}
              title={loc.fullName}
              onClick={() => onSelectLocation(loc)}
            >
              <div
                className={`relative group cursor-pointer transition-transform duration-200 ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                }`}
              >
                {/* Pin Badge */}
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full shadow-lg border text-[11px] font-bold transition-all ${
                    isDest
                      ? 'bg-rose-600 text-white border-white ring-2 ring-rose-400'
                      : isOrigin
                      ? 'bg-emerald-600 text-white border-white ring-2 ring-emerald-400'
                      : isSelected
                      ? 'bg-amber-500 text-slate-950 border-white ring-2 ring-amber-300'
                      : 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="truncate max-w-[85px]">{loc.name}</span>
                </div>

                {/* Pin Tip */}
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white dark:border-t-slate-800 mx-auto -mt-0.5"></div>
              </div>
            </AdvancedMarker>
          );
        })}

        {/* Campus Events Overlay Markers */}
        {showEventsOverlay && events.map((evt) => {
          const isSelected = selectedEvent?.id === evt.id;
          const isLive = evt.status === 'live';
          const cfg = EVENT_CATEGORY_CONFIG[evt.category];

          return (
            <AdvancedMarker
              key={`evt_marker_${evt.id}`}
              position={evt.coordinates}
              title={`${evt.title} (${evt.locationName})`}
              onClick={() => onSelectEvent?.(evt)}
            >
              <div 
                className={`relative group cursor-pointer transition-all duration-300 ${
                  isSelected ? 'scale-125 z-40' : 'hover:scale-115 z-20'
                }`}
                style={{ transform: 'translateY(-22px)' }}
              >
                {/* Live pulsating radar ring */}
                {isLive && (
                  <span className="animate-ping absolute -inset-1 rounded-full bg-rose-500 opacity-75"></span>
                )}

                {/* Event Marker Badge */}
                <div 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-2xl border-2 text-[11px] font-black tracking-tight transition-all backdrop-blur-sm ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/50 shadow-amber-500/50'
                      : isLive
                      ? 'bg-rose-600 text-white border-white shadow-rose-600/40 ring-2 ring-rose-400/40'
                      : 'bg-slate-900/95 text-white border-white/80 shadow-slate-900/50'
                  }`}
                  style={!isSelected && !isLive ? { borderColor: evt.badgeColor || cfg.color } : {}}
                >
                  <span className="text-xs">
                    {evt.category === 'lecture' && '📚'}
                    {evt.category === 'hall_meeting' && '🏛️'}
                    {evt.category === 'seminar' && '💡'}
                    {evt.category === 'ceremony' && '🎓'}
                    {evt.category === 'sports' && '⚽'}
                    {evt.category === 'student_union' && '👥'}
                  </span>
                  <span className="truncate max-w-[95px] sm:max-w-[120px]">
                    {evt.title}
                  </span>
                  {isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  )}
                </div>

                {/* Arrow Pointer Tip */}
                <div 
                  className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] mx-auto -mt-0.5 ${
                    isSelected
                      ? 'border-t-amber-400'
                      : isLive
                      ? 'border-t-rose-600'
                      : 'border-t-slate-900'
                  }`}
                />
              </div>
            </AdvancedMarker>
          );
        })}

        {/* Study Groups Markers at Library & Faculty Locations */}
        {showStudyGroupsOnMap && studyGroups && studyGroups.map((sg) => {
          return (
            <AdvancedMarker
              key={`sg_marker_${sg.id}`}
              position={sg.coordinates}
              title={`Study Group: ${sg.courseCode} - ${sg.courseTitle} at ${sg.locationName}`}
            >
              <div 
                className="relative group cursor-pointer transition-all duration-300 hover:scale-115 z-20"
                style={{ transform: 'translateY(-22px)' }}
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-2xl border-2 text-[11px] font-black tracking-tight bg-emerald-800 text-white border-white ring-2 ring-emerald-400/50">
                  <span className="text-xs">📖</span>
                  <span className="truncate max-w-[100px]">{sg.courseCode}</span>
                  <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 rounded-full font-mono font-bold">
                    {sg.membersCount}/{sg.maxMembers}
                  </span>
                </div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-emerald-800 mx-auto -mt-0.5" />
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>

      {/* Floating Selected Event Spotlight Card on the Map */}
      {selectedEvent && (
        <div className="absolute top-20 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-500/50 p-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedEvent.status === 'live' && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  Live Now
                </span>
              )}
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {selectedEvent.dateStr} • {selectedEvent.timeStr}
              </span>
            </div>
            <button
              onClick={() => onSelectEvent?.(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close event spotlight"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
            {selectedEvent.title}
          </h4>

          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {selectedEvent.locationName}
            </span>
            <span>•</span>
            <span>{selectedEvent.venueDetail}</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
            {selectedEvent.description}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
              For: {selectedEvent.targetAudience}
            </span>
            <button
              onClick={() => onNavigateToEvent?.(selectedEvent)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-300" />
              <span>Navigate Here</span>
            </button>
          </div>
        </div>
      )}

      {/* Offline Mode Active Badge Overlay */}
      {isOfflineMode && (
        <div className="absolute top-20 right-4 z-20 bg-amber-500/90 text-slate-950 font-bold px-3 py-1 rounded-full text-xs shadow-lg backdrop-blur-sm border border-amber-300 flex items-center gap-1.5 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-slate-950"></span>
          <span>Offline Navigation Mode Active</span>
        </div>
      )}
    </div>
  );
};
