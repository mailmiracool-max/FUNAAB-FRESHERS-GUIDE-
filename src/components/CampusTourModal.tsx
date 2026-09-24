import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Navigation, 
  Sparkles, 
  MapPin, 
  Compass,
  Play,
  RotateCcw
} from 'lucide-react';
import { CAMPUS_TOUR_WAYPOINTS, CAMPUS_LOCATIONS } from '../data/campusLocations';
import { CampusLocation } from '../types/campus';

interface CampusTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateWaypoint: (location: CampusLocation) => void;
  onLeadMe: (location: CampusLocation) => void;
}

export const CampusTourModal: React.FC<CampusTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateWaypoint,
  onLeadMe,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const currentTourItem = CAMPUS_TOUR_WAYPOINTS[currentIndex];
  const targetLocation = CAMPUS_LOCATIONS.find((l) => l.id === currentTourItem.locationId);

  const goToWaypoint = (index: number) => {
    setCurrentIndex(index);
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === CAMPUS_TOUR_WAYPOINTS[index].locationId);
    if (loc) {
      onNavigateWaypoint(loc);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < CAMPUS_TOUR_WAYPOINTS.length) {
      goToWaypoint(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex - 1 >= 0) {
      goToWaypoint(currentIndex - 1);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-none">
      <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-amber-500/40 p-4 sm:p-5 pointer-events-auto flex flex-col gap-3 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                FUNAAB Virtual Tour • Step {currentIndex + 1} of {CAMPUS_TOUR_WAYPOINTS.length}
              </span>
              <h3 className="text-base font-bold text-white">
                {currentTourItem.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
          {currentTourItem.story}
        </p>

        {/* Controls and Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === CAMPUS_TOUR_WAYPOINTS.length - 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {targetLocation && (
              <button
                onClick={() => onLeadMe(targetLocation)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                Navigate Here
              </button>
            )}
          </div>
        </div>

        {/* Dots progress indicator */}
        <div className="flex items-center justify-center gap-1 pt-1">
          {CAMPUS_TOUR_WAYPOINTS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToWaypoint(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
