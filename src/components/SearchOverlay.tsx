import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Navigation, 
  Sparkles, 
  GraduationCap, 
  Home, 
  Building, 
  Landmark, 
  Trophy, 
  Clock, 
  ArrowRight,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import { CampusLocation, LocationCategory, UserLocationState } from '../types/campus';
import { CAMPUS_LOCATIONS, CATEGORY_INFO } from '../data/campusLocations';
import { getDistanceMeters, formatDistance } from '../utils/navigationEngine';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: CampusLocation, autoZoom?: boolean) => void;
  onNavigateToLocation: (loc: CampusLocation) => void;
  userLocation: UserLocationState;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onNavigateToLocation,
  userLocation,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearchIds, setRecentSearchIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('funaab_recent_searches');
      return stored ? JSON.parse(stored) : ['1k_cap', 'nimbe_lib', 'senate_build', 'park'];
    } catch {
      return ['1k_cap', 'nimbe_lib', 'senate_build', 'park'];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global hotkey '/' to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter locations by query and category
  const filteredLocations = CAMPUS_LOCATIONS.filter((loc) => {
    const matchesCategory = selectedCategory === 'all' || loc.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    const nameMatch = loc.name.toLowerCase().includes(q);
    const fullNameMatch = loc.fullName.toLowerCase().includes(q);
    const descMatch = loc.description.toLowerCase().includes(q);
    const collegeMatch = loc.college ? loc.college.toLowerCase().includes(q) : false;
    const aliasMatch = loc.aliases.some((alias) => alias.toLowerCase().includes(q));

    return nameMatch || fullNameMatch || descMatch || collegeMatch || aliasMatch;
  });

  // Calculate distance for each location if user location is available
  const locationsWithDistance = filteredLocations.map((loc) => {
    let distanceMeters: number | null = null;
    if (userLocation.coords) {
      distanceMeters = getDistanceMeters(userLocation.coords, loc.coordinates);
    }
    return { ...loc, distanceMeters };
  });

  // If user searched, sort by exact name match first, then by distance if available
  const sortedResults = [...locationsWithDistance].sort((a, b) => {
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      const aExact = a.name.toLowerCase() === q;
      const bExact = b.name.toLowerCase() === q;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = a.name.toLowerCase().startsWith(q) || a.fullName.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q) || b.fullName.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
    }
    if (a.distanceMeters !== null && b.distanceMeters !== null) {
      return a.distanceMeters - b.distanceMeters;
    }
    return 0;
  });

  // Save recent search
  const handleSelect = (loc: CampusLocation) => {
    const updated = [loc.id, ...recentSearchIds.filter((id) => id !== loc.id)].slice(0, 8);
    setRecentSearchIds(updated);
    try {
      localStorage.setItem('funaab_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
    onSelectLocation(loc, true);
    onClose();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < sortedResults.length ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (sortedResults[selectedIndex]) {
        handleSelect(sortedResults[selectedIndex]);
      }
    }
  };

  const getCategoryIcon = (category: LocationCategory) => {
    switch (category) {
      case 'academic': return <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'theatre': return <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'hostel': return <Home className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'facility': return <Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'landmark': return <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'recreation': return <Trophy className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
    }
  };

  const recentLocations = recentSearchIds
    .map((id) => CAMPUS_LOCATIONS.find((l) => l.id === id))
    .filter(Boolean) as CampusLocation[];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-modal-backdrop">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-emerald-100 dark:border-slate-800 overflow-hidden mt-6 sm:mt-12 flex flex-col max-h-[85vh] animate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-gradient-to-r from-emerald-50/50 to-amber-50/30 dark:from-slate-900 dark:to-slate-900">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search FUNAAB campus (e.g. 1K CAP, COLENG, Nimbe Lib, Male Hostel...)"
            className="w-full text-base sm:text-lg font-medium text-slate-800 dark:text-white bg-transparent focus:outline-none placeholder:text-slate-400"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All Places ({CAMPUS_LOCATIONS.length})
          </button>
          {(['theatre', 'academic', 'hostel', 'facility', 'landmark', 'recreation'] as LocationCategory[]).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {CATEGORY_INFO[cat].label}
              </button>
            )
          )}
        </div>

        {/* Popular Fast Jumps when query is empty */}
        {!query && (
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              Popular Destinations
            </div>
            <div className="flex flex-wrap gap-2">
              {CAMPUS_LOCATIONS.filter((l) => l.popular).slice(0, 7).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-900 dark:text-emerald-200 rounded-lg border border-emerald-200/60 dark:border-slate-700 font-medium transition"
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800">
          {sortedResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-base font-medium">No campus buildings matching "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">
                Try checking abbreviations like COLENG, 1K CAP, SUB, NIMBE, or Hostels.
              </p>
            </div>
          ) : (
            sortedResults.map((loc, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={loc.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(loc)}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-slate-800/80 border-emerald-300 dark:border-slate-700 shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      {getCategoryIcon(loc.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                          {loc.name}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {CATEGORY_INFO[loc.category].label}
                        </span>
                        {loc.popular && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                            Hotspot
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {loc.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {loc.distanceMeters !== null && (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md border border-emerald-200/50">
                        {formatDistance(loc.distanceMeters)}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToLocation(loc);
                        onClose();
                      }}
                      title="Calculate route to this location"
                      className="p-2 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-slate-700 rounded-lg transition"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>

                    <ArrowRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'translate-x-1 text-emerald-600' : ''}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono">Enter</kbd> Zoom & Pan</span>
            <span><kbd className="px-1 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono">ESC</kbd> Close</span>
          </div>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            {sortedResults.length} FUNAAB locations
          </span>
        </div>
      </div>
    </div>
  );
};
