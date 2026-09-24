import React, { useState } from 'react';
import { 
  X, 
  Navigation, 
  MapPin, 
  Share2, 
  Copy, 
  Check, 
  Info, 
  Footprints, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CampusLocation, UserLocationState } from '../types/campus';
import { CATEGORY_INFO } from '../data/campusLocations';
import { getDistanceMeters, formatDistance, formatDuration } from '../utils/navigationEngine';

interface LocationDetailModalProps {
  location: CampusLocation | null;
  onClose: () => void;
  onNavigateToLocation: (loc: CampusLocation) => void;
  onSetAsCurrentLocation?: (loc: CampusLocation) => void;
  userLocation: UserLocationState;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  location,
  onClose,
  onNavigateToLocation,
  onSetAsCurrentLocation,
  userLocation,
}) => {
  const [copied, setCopied] = useState(false);
  const [markedHere, setMarkedHere] = useState(false);

  if (!location) return null;

  const distanceMeters = userLocation.coords
    ? getDistanceMeters(userLocation.coords, location.coordinates)
    : null;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${location.coordinates.lat}, ${location.coordinates.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${location.name} - FUNAAB Map`,
        text: `Find ${location.fullName} on the FUNAAB Campus Map`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyCoords();
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-30 w-[calc(100%-2rem)] sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-200 dark:border-slate-800 p-4 flex flex-col gap-3 animate-slide-up">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-900 dark:text-white truncate">
              {location.name}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-slate-800 dark:text-emerald-300 flex-shrink-0">
              {CATEGORY_INFO[location.category].label.split(' ')[0]}
            </span>
          </div>
          <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
            {location.fullName}
          </h4>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {location.description}
      </p>

      {/* Tips if available */}
      {location.tips && (
        <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>{location.tips}</span>
        </div>
      )}

      {/* Distance Stats from User Device */}
      {distanceMeters !== null && (
        <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 font-medium">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5 text-emerald-600" />
            Distance from you:
          </span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">
            {formatDistance(distanceMeters)} ({formatDuration(Math.round(distanceMeters / 1.25))} walk)
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToLocation(location)}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition"
          >
            <Navigation className="w-4 h-4" />
            Lead Me Here
          </button>

          {onSetAsCurrentLocation && (
            <button
              onClick={() => {
                onSetAsCurrentLocation(location);
                setMarkedHere(true);
                setTimeout(() => setMarkedHere(false), 2500);
              }}
              title="Set as my current location"
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                markedHere
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-slate-700'
              }`}
            >
              {markedHere ? <Check className="w-4 h-4" /> : <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              <span>{markedHere ? 'Position Set!' : 'I Am Here'}</span>
            </button>
          )}

          <button
            onClick={handleCopyCoords}
            title="Copy GPS Coordinates"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleShare}
            title="Share this location"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
