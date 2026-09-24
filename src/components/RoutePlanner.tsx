import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  ArrowUpDown, 
  Footprints, 
  Car, 
  Clock, 
  Milestone, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  Play, 
  Square,
  Flame,
  CornerDownRight,
  CornerDownLeft,
  ArrowUp
} from 'lucide-react';
import { CampusLocation, CalculatedRoute, RouteStep, TravelMode, UserLocationState } from '../types/campus';
import { CAMPUS_LOCATIONS } from '../data/campusLocations';
import { calculateCampusRoute, formatDistance, formatDuration, getDistanceMeters } from '../utils/navigationEngine';

interface RoutePlannerProps {
  userLocation: UserLocationState;
  selectedLocation: CampusLocation | null;
  activeRoute: CalculatedRoute | null;
  setActiveRoute: (route: CalculatedRoute | null) => void;
  isNavigating: boolean;
  setIsNavigating: (nav: boolean) => void;
  onFocusStep?: (step: RouteStep, index: number) => void;
  onClose?: () => void;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  userLocation,
  selectedLocation,
  activeRoute,
  setActiveRoute,
  isNavigating,
  setIsNavigating,
  onFocusStep,
  onClose,
}) => {
  const [originType, setOriginType] = useState<'my_location' | 'building'>('my_location');
  const [originBuildingId, setOriginBuildingId] = useState<string>('sch_gate');
  const [destinationBuildingId, setDestinationBuildingId] = useState<string>(
    selectedLocation ? selectedLocation.id : '1k_cap'
  );
  const [travelMode, setTravelMode] = useState<TravelMode>('WALKING');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // Update destination if selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      setDestinationBuildingId(selectedLocation.id);
    }
  }, [selectedLocation]);

  // Recalculate route whenever parameters change
  useEffect(() => {
    calculateCurrentRoute();
  }, [originType, originBuildingId, destinationBuildingId, travelMode, userLocation.coords]);

  const calculateCurrentRoute = () => {
    let originCoords: { lat: number; lng: number } | null = null;
    let originName = 'My Location';

    if (originType === 'my_location') {
      if (userLocation.coords) {
        originCoords = userLocation.coords;
        originName = userLocation.locationName ? `My Location (${userLocation.locationName.replace(' (Simulated)', '')})` : 'My Location';
      } else {
        // Fallback default: NEEDS Hostel
        const defaultOrigin = CAMPUS_LOCATIONS.find((l) => l.id === 'old_need_male') || CAMPUS_LOCATIONS[0];
        originCoords = defaultOrigin.coordinates;
        originName = `${defaultOrigin.name} (GPS off)`;
      }
    } else {
      const loc = CAMPUS_LOCATIONS.find((l) => l.id === originBuildingId);
      if (loc) {
        originCoords = loc.coordinates;
        originName = loc.name;
      }
    }

    const destLoc = CAMPUS_LOCATIONS.find((l) => l.id === destinationBuildingId);
    if (!originCoords || !destLoc) return;

    // Calculate route using campus navigation engine
    const route = calculateCampusRoute(
      originCoords,
      destLoc.coordinates,
      originName,
      destLoc.name,
      travelMode
    );

    setActiveRoute(route);
  };

  const handleSwap = () => {
    if (originType === 'my_location') {
      setOriginType('building');
      setOriginBuildingId(destinationBuildingId);
      setDestinationBuildingId('sch_gate');
    } else {
      const temp = originBuildingId;
      setOriginBuildingId(destinationBuildingId);
      setDestinationBuildingId(temp);
    }
  };

  const handleToggleNavigation = () => {
    if (isNavigating) {
      setIsNavigating(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsNavigating(true);
      if (voiceEnabled && activeRoute && 'speechSynthesis' in window) {
        const dest = CAMPUS_LOCATIONS.find((l) => l.id === destinationBuildingId);
        const utterance = new SpeechSynthesisUtterance(
          `Starting navigation to ${dest?.fullName || 'destination'}. ${activeRoute.steps[0]?.instruction || ''}`
        );
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const calories = activeRoute
    ? Math.round((activeRoute.distanceMeters / 1000) * (travelMode === 'WALKING' ? 65 : 12))
    : 0;

  const estimatedSteps = activeRoute ? Math.round(activeRoute.distanceMeters / 0.75) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-emerald-100 dark:border-slate-800 p-4 sm:p-5 flex flex-col gap-4">
      {/* Route Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">FUNAAB Route Planner</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live step-by-step campus routing &amp; GPS guidance
            </p>
          </div>
        </div>

        {/* Travel Mode Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTravelMode('WALKING')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              travelMode === 'WALKING'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Footprints className="w-4 h-4" />
            Walk
          </button>
          <button
            onClick={() => setTravelMode('DRIVING')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              travelMode === 'DRIVING'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            Drive / Shuttle
          </button>
        </div>
      </div>

      {/* Origin & Destination Inputs */}
      <div className="relative flex flex-col gap-2">
        {/* Origin Field */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-emerald-300">
            A
          </div>
          <div className="flex-1 flex gap-2">
            <select
              value={originType}
              onChange={(e) => setOriginType(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-medium rounded-xl px-2.5 py-2 border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="my_location">📍 My Device Location</option>
              <option value="building">🏢 Choose Campus Building</option>
            </select>

            {originType === 'building' ? (
              <select
                value={originBuildingId}
                onChange={(e) => setOriginBuildingId(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold rounded-xl px-2.5 py-2 border border-slate-200 dark:border-slate-700"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} - {loc.fullName.slice(0, 30)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex-1 px-3 py-2 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-medium text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
                <span>{userLocation.coords ? (userLocation.isSimulated ? 'Campus Sim (Gate)' : 'Live GPS Device') : 'School Gate (Default)'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1 z-10">
          <button
            onClick={handleSwap}
            title="Swap Origin and Destination"
            className="p-1.5 rounded-full bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 transition shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Field */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-rose-300">
            B
          </div>
          <select
            value={destinationBuildingId}
            onChange={(e) => setDestinationBuildingId(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-emerald-500"
          >
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} — {loc.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Route Metric Stats Cards */}
      {activeRoute && (
        <div className="grid grid-cols-3 gap-2 bg-gradient-to-r from-emerald-50 to-amber-50/50 dark:from-slate-800/80 dark:to-slate-800/40 p-3 rounded-xl border border-emerald-100 dark:border-slate-700/60">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Milestone className="w-3 h-3 text-emerald-600" />
              Distance
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {formatDistance(activeRoute.distanceMeters)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              Est. Time
            </span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
              {formatDuration(activeRoute.durationSeconds)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-500" />
              {travelMode === 'WALKING' ? 'Calories' : 'Pace'}
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {travelMode === 'WALKING' ? `~${calories} kcal` : '~25 km/h'}
            </span>
          </div>
        </div>
      )}

      {/* Live Navigation CTA Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleNavigation}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
            isNavigating
              ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20'
          }`}
        >
          {isNavigating ? (
            <>
              <Square className="w-4 h-4 fill-white" />
              Stop Live Navigation
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              Start Live Navigation
            </>
          )}
        </button>

        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          title={voiceEnabled ? 'Voice Guidance Active' : 'Voice Guidance Muted'}
          className={`p-3 rounded-xl border transition ${
            voiceEnabled
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Step-by-Step Directions */}
      {activeRoute && activeRoute.steps.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Step-by-Step Directions ({activeRoute.steps.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {travelMode === 'WALKING' ? `Approx. ${estimatedSteps} steps` : 'Campus Road'}
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 pr-1">
            {activeRoute.steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => onFocusStep && onFocusStep(step, idx)}
                className="py-2.5 px-2 flex items-start gap-2.5 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-slate-800/60 cursor-pointer transition text-xs"
              >
                <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-600 dark:text-slate-300 mt-0.5">
                  {step.maneuver === 'turn-left' ? (
                    <CornerDownLeft className="w-3.5 h-3.5 text-blue-500" />
                  ) : step.maneuver === 'turn-right' ? (
                    <CornerDownRight className="w-3.5 h-3.5 text-blue-500" />
                  ) : step.maneuver === 'arrive' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {step.instruction}
                  </p>
                  {step.distanceMeters > 0 && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatDistance(step.distanceMeters)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
