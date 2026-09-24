import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Navigation, 
  X, 
  Check, 
  RotateCw, 
  Radio, 
  AlertCircle, 
  Sparkles, 
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { UserLocationState, CampusLocation } from '../types/campus';
import { CAMPUS_LOCATION_PRESETS, CampusLocationPreset } from '../hooks/usePreciseGeolocation';
import { CAMPUS_LOCATIONS } from '../data/campusLocations';

interface LocationCalibratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocationState;
  onSetLocation: (coords: { lat: number; lng: number }, name?: string) => void;
  onRefreshRealGps: () => void;
  onRecenter: () => void;
}

export const LocationCalibratorModal: React.FC<LocationCalibratorModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onSetLocation,
  onRefreshRealGps,
  onRecenter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefreshGps = () => {
    setIsRefreshing(true);
    onRefreshRealGps();
    setTimeout(() => {
      setIsRefreshing(false);
      onRecenter();
    }, 1200);
  };

  const handleSelectPreset = (preset: CampusLocationPreset) => {
    onSetLocation(preset.coords, preset.name);
    onClose();
  };

  const handleSelectCustomBuilding = (loc: CampusLocation) => {
    onSetLocation(loc.coordinates, loc.name);
    onClose();
  };

  const filteredLocations = searchQuery.trim()
    ? CAMPUS_LOCATIONS.filter((l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-modal-backdrop">
      <div 
        className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gps-calibrator-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 id="gps-calibrator-title" className="text-base font-bold">
                GPS Location & Origin Calibrator
              </h3>
              <p className="text-xs text-emerald-200/80">
                Fix your position at NEEDS Hostel, School Gate, or use real hardware GPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Location Status Card */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Current Map Position:
            </span>
            <span 
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                !userLocation.isSimulated
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              <Radio className="w-3 h-3 animate-ping" />
              {!userLocation.isSimulated ? 'Real GPS Active' : 'Preset / Simulated'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {userLocation.locationName || 'Unknown Campus Coordinates'}
                </h4>
                {userLocation.coords && (
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    Lat: {userLocation.coords.lat.toFixed(5)}, Lng: {userLocation.coords.lng.toFixed(5)}
                    {userLocation.accuracy && ` (±${userLocation.accuracy}m)`}
                  </p>
                )}
              </div>
            </div>

            {/* Recalibrate / Force GPS button */}
            <button
              onClick={handleRefreshGps}
              disabled={isRefreshing}
              title="Request fresh satellite/Wi-Fi fix from browser"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition flex-shrink-0 shadow-md shadow-emerald-700/20 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh GPS</span>
            </button>
          </div>

          {userLocation.error && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{userLocation.error}</span>
            </div>
          )}
        </div>

        {/* Content Body: Quick Presets */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* Quick Hostel Callout if user was at gate */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/60 p-3.5 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏨</span>
              <div>
                <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  Currently at NEEDS Hostel?
                </p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
                  Instantly set your location to NEEDS (Old/New Hostels) with 1 click:
                </p>
              </div>
            </div>
            <button
              onClick={() => handleSelectPreset(CAMPUS_LOCATION_PRESETS[0])}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1 flex-shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Set NEEDS</span>
            </button>
          </div>

          {/* Quick Presets Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Common Starting Points on Campus
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAMPUS_LOCATION_PRESETS.map((preset) => {
                const isCurrent = 
                  userLocation.coords &&
                  Math.abs(userLocation.coords.lat - preset.coords.lat) < 0.0005 &&
                  Math.abs(userLocation.coords.lng - preset.coords.lng) < 0.0005;

                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                      isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-600'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{preset.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {preset.name}
                        </span>
                        {preset.badge && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                            {preset.badge}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-auto flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            Here
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search any building to set as location */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Or pick any specific hostel block / building:
            </h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search e.g. Old Need Male, New Needs Female, IYAT..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {filteredLocations.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                {filteredLocations.slice(0, 6).map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => handleSelectCustomBuilding(loc)}
                    className="w-full px-3 py-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {loc.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {loc.fullName}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Set as origin →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Real GPS uses browser geolocation with zero tracking server.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
