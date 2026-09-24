import React from 'react';
import { 
  Compass, 
  MapPin, 
  Route as RouteIcon, 
  Layers, 
  Sparkles, 
  Navigation, 
  Map as MapIcon, 
  Search,
  Radio,
  Share2,
  CloudOff,
  HardDrive,
  Sun,
  Moon,
  Calendar,
  Download,
  Calculator,
  BookOpen
} from 'lucide-react';
import { UserLocationState } from '../types/campus';
import { PWAInstallButton } from './PWAInstallButton';
import { Theme } from '../hooks/useTheme';

interface HeaderNavbarProps {
  activeTab: 'map' | 'routes' | 'directory' | 'diagram' | 'tour';
  setActiveTab: (tab: 'map' | 'routes' | 'directory' | 'diagram' | 'tour') => void;
  userLocation: UserLocationState;
  onToggleSimulateLocation: () => void;
  onLocateUser: () => void;
  mapType: string;
  setMapType: (type: string) => void;
  onOpenSearch: () => void;
  onOpenOfflineModal: () => void;
  cachedRegionsCount: number;
  isOfflineMode: boolean;
  theme: Theme;
  toggleTheme: () => void;
  onOpenEvents?: () => void;
  eventsCount?: number;
  liveEventsCount?: number;
  onOpenLocationCalibrator?: () => void;
  onOpenInstallModal?: () => void;
  onOpenCGPACalculator?: () => void;
  onOpenGoogleWorkspaceSuite?: () => void;
  onOpenFreshersGuide?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  setActiveTab,
  userLocation,
  onToggleSimulateLocation,
  onLocateUser,
  mapType,
  setMapType,
  onOpenSearch,
  onOpenOfflineModal,
  cachedRegionsCount,
  isOfflineMode,
  theme,
  toggleTheme,
  onOpenEvents,
  eventsCount,
  liveEventsCount,
  onOpenLocationCalibrator,
  onOpenInstallModal,
  onOpenCGPACalculator,
  onOpenGoogleWorkspaceSuite,
  onOpenFreshersGuide,
}) => {
  return (
    <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-30 border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & University Identity */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('map')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-1 flex items-center justify-center shadow-lg shadow-emerald-950/50 ring-2 ring-amber-400/50 group-hover:scale-105 transition duration-200">
              <img src="/icon.svg" alt="FUNAAB Crest" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  FUNAAB <span className="text-amber-400 font-extrabold">Freshers Guide</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black bg-amber-400 text-slate-950 rounded-full uppercase tracking-wider shadow-sm">
                  Smart GPS & AI
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 hidden md:block font-medium">
                Federal University of Agriculture, Abeokuta • Smart Campus GPS & Google Workspace Hub
              </p>
            </div>
          </div>

          {/* Center: Navigation Action Buttons */}
          <div className="hidden lg:flex items-center gap-1 bg-emerald-950/60 p-1.5 rounded-xl border border-emerald-800/80 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Live Map
            </button>

            {/* Freshers Guide Button */}
            {onOpenFreshersGuide && (
              <button
                onClick={onOpenFreshersGuide}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
              >
                <Compass className="w-4 h-4 text-slate-950" />
                <span>Freshers Guide</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('routes')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'routes'
                  ? 'bg-amber-500 text-emerald-950 shadow-sm font-bold'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <RouteIcon className="w-4 h-4" />
              Route Planner
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'directory'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Directory ({48})
            </button>

            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'diagram'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Blueprint
            </button>

            <button
              onClick={() => setActiveTab('tour')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'tour'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <Navigation className="w-4 h-4 text-amber-300" />
              Virtual Tour
            </button>

            {/* Events Overlay Button */}
            <button
              onClick={onOpenEvents}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-emerald-200 hover:text-white hover:bg-emerald-800/50 relative group"
              title="Open Campus Events & Lectures Overlay"
            >
              <Calendar className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Events</span>
              {liveEventsCount !== undefined && liveEventsCount > 0 ? (
                <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                  {liveEventsCount} Live
                </span>
              ) : eventsCount !== undefined ? (
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.2 rounded-full font-mono">
                  {eventsCount}
                </span>
              ) : null}
            </button>
          </div>

          {/* Right Controls: Device GPS & Search */}
          <div className="flex items-center gap-2">
            {/* Quick Search Trigger */}
            <button
              onClick={onOpenSearch}
              aria-label="Search campus buildings"
              className="flex items-center gap-2 px-3 py-2 bg-emerald-800/70 hover:bg-emerald-800 text-emerald-100 hover:text-white rounded-xl text-xs font-medium border border-emerald-700/60 transition shadow-inner"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Search building...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-emerald-950/60 rounded text-emerald-300 font-mono">
                /
              </kbd>
            </button>

            {/* GPS Status Indicator & Calibrator */}
            <div className="flex items-center gap-1 bg-emerald-950/70 p-1 rounded-xl border border-emerald-800">
              <button
                onClick={onOpenLocationCalibrator || onLocateUser}
                title={
                  userLocation.locationName
                    ? `${userLocation.locationName}. Click to calibrate GPS or switch to NEEDS Hostel`
                    : 'Click to calibrate your location'
                }
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium hover:text-amber-300 transition"
              >
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      userLocation.lockStatus === 'high-precision' || (userLocation.accuracy && userLocation.accuracy <= 6)
                        ? 'bg-emerald-300'
                        : userLocation.active
                        ? 'bg-emerald-400'
                        : 'bg-amber-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      userLocation.lockStatus === 'high-precision' || (userLocation.accuracy && userLocation.accuracy <= 6)
                        ? 'bg-emerald-400'
                        : userLocation.active
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                  ></span>
                </span>
                <span className="text-[11px] font-bold max-w-[95px] sm:max-w-[125px] truncate">
                  {userLocation.locationName ? userLocation.locationName.replace(' (Simulated)', '') : 'NEEDS Hostel'}
                </span>
                {userLocation.accuracy && (
                  <span className="hidden md:inline text-[9px] text-emerald-300 font-mono bg-emerald-900/60 px-1 py-0.2 rounded border border-emerald-700/50">
                    ±{userLocation.accuracy}m
                  </span>
                )}
              </button>

              <button
                onClick={onOpenLocationCalibrator || onToggleSimulateLocation}
                title="Calibrate GPS / Switch location to NEEDS Hostel, Gate, etc."
                className="text-[10px] px-2 py-0.5 bg-emerald-800 hover:bg-amber-500 hover:text-emerald-950 text-emerald-200 rounded-lg transition font-mono font-bold"
              >
                Fix
              </button>
            </div>

            {/* In-App Install App Button */}
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                title="Install FUNAAB Map App on your home screen"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black shadow-md transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden text-[11px]">App</span>
              </button>
            )}

            {/* Google Workspace Suite Button */}
            {onOpenGoogleWorkspaceSuite && (
              <button
                onClick={onOpenGoogleWorkspaceSuite}
                title="Open Google Workspace Suite (Classroom, Meet, Drive, Docs, Calendar)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md"
              >
                <div className="flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                </div>
                <span className="hidden lg:inline">Google Workspace</span>
                <span className="lg:hidden text-[11px]">Workspace</span>
              </button>
            )}

            {/* CGPA Calculator Button */}
            {onOpenCGPACalculator && (
              <button
                onClick={onOpenCGPACalculator}
                title="FUNAAB 5.0 CGPA & Grade Calculator"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-700 text-xs font-bold transition shadow"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">CGPA Calc</span>
                <span className="sm:hidden text-[11px]">CGPA</span>
              </button>
            )}

            {/* Offline Maps Modal Button */}
            <button
              onClick={onOpenOfflineModal}
              title="Manage Offline Campus Map Regions"
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition ${
                isOfflineMode
                  ? 'bg-amber-500 text-emerald-950 border-amber-300 animate-pulse'
                  : cachedRegionsCount > 0
                  ? 'bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border-emerald-700'
                  : 'bg-emerald-950/70 hover:bg-emerald-800 text-emerald-200 border-emerald-800'
              }`}
            >
              <CloudOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Offline</span>
              {cachedRegionsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cachedRegionsCount}
                </span>
              )}
            </button>

            {/* Persistent Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-800 hover:border-emerald-700 transition cursor-pointer shadow-sm group"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
                  <span className="hidden md:inline text-amber-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-200 group-hover:-rotate-12 transition-transform" />
                  <span className="hidden md:inline text-emerald-200">Dark</span>
                </>
              )}
            </button>

            {/* PWA In-App Install Button */}
            <PWAInstallButton />

            {/* Map Type Selector */}
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value)}
              aria-label="Map style"
              className="bg-emerald-950 text-emerald-100 text-xs rounded-xl px-2 py-2 border border-emerald-800 focus:outline-none focus:ring-1 focus:ring-amber-400 hidden sm:block"
            >
              <option value="roadmap">Default Map</option>
              <option value="satellite">Satellite</option>
              <option value="hybrid">Hybrid Aerial</option>
              <option value="terrain">Campus Terrain</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-emerald-800/80 px-2 py-1.5 bg-emerald-950/80">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded text-[11px] font-medium ${
            activeTab === 'map' ? 'text-amber-400 font-bold' : 'text-emerald-300'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          Map
        </button>

        {onOpenFreshersGuide && (
          <button
            onClick={onOpenFreshersGuide}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded text-[11px] font-bold text-amber-400"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            Freshers
          </button>
        )}

        <button
          onClick={() => setActiveTab('routes')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded text-[11px] font-medium ${
            activeTab === 'routes' ? 'text-amber-400 font-bold' : 'text-emerald-300'
          }`}
        >
          <RouteIcon className="w-4 h-4" />
          Directions
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded text-[11px] font-medium ${
            activeTab === 'directory' ? 'text-amber-400 font-bold' : 'text-emerald-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          Directory
        </button>

        <button
          onClick={() => setActiveTab('diagram')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded text-[11px] font-medium ${
            activeTab === 'diagram' ? 'text-amber-400 font-bold' : 'text-emerald-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Blueprint
        </button>

        <button
          onClick={onOpenEvents}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded text-[11px] font-medium text-emerald-300 hover:text-amber-300 relative"
        >
          <div className="relative">
            <Calendar className="w-4 h-4 text-amber-300" />
            {liveEventsCount !== undefined && liveEventsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </div>
          <span>Events</span>
        </button>
      </div>
    </header>
  );
};
