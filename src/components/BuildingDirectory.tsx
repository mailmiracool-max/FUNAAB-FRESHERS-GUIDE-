import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Home, 
  Building, 
  Landmark, 
  Trophy, 
  Search, 
  Navigation, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { CampusLocation, LocationCategory, UserLocationState } from '../types/campus';
import { CAMPUS_LOCATIONS, CATEGORY_INFO } from '../data/campusLocations';
import { getDistanceMeters, formatDistance } from '../utils/navigationEngine';

interface BuildingDirectoryProps {
  onSelectLocation: (loc: CampusLocation, autoZoom?: boolean) => void;
  onNavigateToLocation: (loc: CampusLocation) => void;
  userLocation: UserLocationState;
}

export const BuildingDirectory: React.FC<BuildingDirectoryProps> = ({
  onSelectLocation,
  onNavigateToLocation,
  userLocation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'all'>('all');
  const [filterText, setFilterText] = useState('');

  const filtered = CAMPUS_LOCATIONS.filter((loc) => {
    if (selectedCategory !== 'all' && loc.category !== selectedCategory) return false;
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.fullName.toLowerCase().includes(q) ||
      loc.description.toLowerCase().includes(q) ||
      (loc.college && loc.college.toLowerCase().includes(q))
    );
  });

  const withDistances = filtered.map((loc) => {
    let distanceMeters: number | null = null;
    if (userLocation.coords) {
      distanceMeters = getDistanceMeters(userLocation.coords, loc.coordinates);
    }
    return { ...loc, distanceMeters };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-emerald-100 dark:border-slate-800 p-4 sm:p-6 flex flex-col gap-4">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Campus Directory &amp; Facilities
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse all colleges, lecture auditoriums, hostels, and service centers in FUNAAB
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter list..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All Locations ({CAMPUS_LOCATIONS.length})
        </button>
        {(['academic', 'theatre', 'hostel', 'facility', 'landmark', 'recreation'] as LocationCategory[]).map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {CATEGORY_INFO[cat].label}
            </button>
          )
        )}
      </div>

      {/* Grid of location cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
        {withDistances.map((loc) => (
          <div
            key={loc.id}
            onClick={() => onSelectLocation(loc, true)}
            className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-emerald-50/50 dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 cursor-pointer transition shadow-sm flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-amber-400 transition">
                  {loc.name}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {CATEGORY_INFO[loc.category].label.split(' ')[0]}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                {loc.fullName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {loc.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 mt-1">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {loc.distanceMeters !== null ? `${formatDistance(loc.distanceMeters)} away` : 'Campus Map'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToLocation(loc);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 shadow-sm transition"
                >
                  <Navigation className="w-3 h-3" />
                  Route
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
