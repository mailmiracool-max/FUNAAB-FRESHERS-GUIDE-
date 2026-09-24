/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { 
  Navigation, 
  MapPin, 
  Route as RouteIcon, 
  Search, 
  Compass, 
  LocateFixed, 
  Sparkles, 
  Layers, 
  PhoneCall, 
  AlertCircle,
  HelpCircle,
  X,
  Footprints,
  Calendar
} from 'lucide-react';

import { CampusLocation, CalculatedRoute, RouteStep, UserLocationState, CampusEvent, StudyGroup } from './types/campus';
import { CAMPUS_CENTER, CAMPUS_LOCATIONS } from './data/campusLocations';
import { HeaderNavbar } from './components/HeaderNavbar';
import { CampusMap } from './components/CampusMap';
import { SearchOverlay } from './components/SearchOverlay';
import { RoutePlanner } from './components/RoutePlanner';
import { LiveNavigationHUD } from './components/LiveNavigationHUD';
import { LocationDetailModal } from './components/LocationDetailModal';
import { CampusIllustratedDiagram } from './components/CampusIllustratedDiagram';
import { BuildingDirectory } from './components/BuildingDirectory';
import { CampusTourModal } from './components/CampusTourModal';
import { OfflineMapsModal } from './components/OfflineMapsModal';
import { CampusEventsOverlay } from './components/CampusEventsOverlay';
import { calculateCampusRoute } from './utils/navigationEngine';
import { CampusRegion, getSavedRegionsMeta } from './utils/offlineMapManager';
import { getStoredCampusEvents } from './data/campusEvents';
import { 
  getStoredStudyGroups, 
  saveStudyGroup, 
  updateStudyGroupMembership, 
  sendStudyGroupMessage,
  addClassroomAnnouncement,
  addDriveWorkspaceFile,
  toggleAssignmentSubmission
} from './data/studyGroups';
import { GoogleWorkspaceHubModal } from './components/GoogleWorkspaceHubModal';
import { FreshersGuideModal } from './components/FreshersGuideModal';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useTheme } from './hooks/useTheme';
import { usePreciseGeolocation, FUNAAB_DEFAULT_GATE, FUNAAB_NEEDS_HOSTEL } from './hooks/usePreciseGeolocation';
import { LocationCalibratorModal } from './components/LocationCalibratorModal';
import { AppInstallModal } from './components/AppInstallModal';
import { CGPACalculatorModal } from './components/CGPACalculatorModal';
import { StudyRoomsSpace } from './components/StudyRoomsSpace';
import { CloudOff } from 'lucide-react';

export default function App() {
  const isOnline = useOnlineStatus();
  const { theme, toggleTheme } = useTheme();
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'cgpa_advisor' | 'study_rooms' | 'routes' | 'directory' | 'diagram' | 'tour'>('map');
  const [mapType, setMapType] = useState<string>('roadmap');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [highlightedRegion, setHighlightedRegion] = useState<CampusRegion | null>(null);
  const [cachedRegionsCount, setCachedRegionsCount] = useState<number>(() => {
    return Object.keys(getSavedRegionsMeta()).length;
  });
  const [isApproachingTurn, setIsApproachingTurn] = useState(false);
  const [approachingTurnCoord, setApproachingTurnCoord] = useState<{ lat: number; lng: number } | null>(null);

  // Freshers Guide Modal State
  const [isFreshersGuideOpen, setIsFreshersGuideOpen] = useState(false);

  // Campus Events Overlay State
  const [events, setEvents] = useState<CampusEvent[]>(() => getStoredCampusEvents());
  const [isEventsOverlayOpen, setIsEventsOverlayOpen] = useState(false);
  const [showEventsOnMap, setShowEventsOnMap] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  // Study Groups State
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(() => getStoredStudyGroups());
  const [showStudyGroupsOnMap, setShowStudyGroupsOnMap] = useState(true);

  const handleStudyGroupCreated = (newGroup: StudyGroup) => {
    const updated = saveStudyGroup(newGroup);
    setStudyGroups(updated);
  };

  const handleUpdateStudyGroupMembership = (groupId: string, studentName: string, join: boolean) => {
    const updated = updateStudyGroupMembership(groupId, studentName, join);
    setStudyGroups(updated);
  };

  const handleSendStudyGroupMessage = (groupId: string, sender: string, text: string) => {
    const updated = sendStudyGroupMessage(groupId, sender, text);
    setStudyGroups(updated);
  };

  // Google Workspace Hub Modal State & Handlers
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [activeWorkspaceGroupId, setActiveWorkspaceGroupId] = useState<string | null>(null);

  const handleOpenWorkspace = (group: StudyGroup) => {
    setActiveWorkspaceGroupId(group.id);
    setIsWorkspaceOpen(true);
  };

  const handleAddAnnouncement = (groupId: string, author: string, text: string) => {
    const updated = addClassroomAnnouncement(groupId, author, text);
    setStudyGroups(updated);
  };

  const handleAddDriveFile = (groupId: string, file: { name: string; type: 'doc' | 'sheet' | 'slide' | 'form' | 'pdf'; author: string; content?: string }) => {
    const updated = addDriveWorkspaceFile(groupId, file);
    setStudyGroups(updated);
  };

  const handleToggleAssignment = (groupId: string, assignmentId: string) => {
    const updated = toggleAssignmentSubmission(groupId, assignmentId);
    setStudyGroups(updated);
  };

  // Selected Location for details drawer
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);

  // Active calculated route
  const [activeRoute, setActiveRoute] = useState<CalculatedRoute | null>(null);

  // Live Navigation State
  const [isNavigating, setIsNavigating] = useState(false);

  // Location Calibrator & Install App Modal States
  const [isLocationCalibratorOpen, setIsLocationCalibratorOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isCGPACalculatorOpen, setIsCGPACalculatorOpen] = useState(false);

  // High-Precision Geolocation & Sensor Fusion Engine
  const {
    userLocation,
    setUserLocation,
    startRealGeolocation,
    setManualLocation,
    toggleSimulateLocation,
    triggerRecenter,
    recenterTimestamp,
  } = usePreciseGeolocation(activeRoute, isNavigating);

  // Listen for Google Maps quota exceeded event
  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Handle Location Selection
  const handleSelectLocation = (loc: CampusLocation, autoZoom = true) => {
    setSelectedLocation(loc);
    if (activeTab !== 'map') {
      setActiveTab('map');
    }
  };

  // Quick "Lead Me Here / Navigate"
  const handleNavigateToLocation = (loc: CampusLocation) => {
    setSelectedLocation(loc);
    const startCoords = userLocation.coords || FUNAAB_NEEDS_HOSTEL;
    const originLabel = userLocation.locationName
      ? userLocation.locationName.replace(' (Simulated)', '')
      : 'My Location';

    const route = calculateCampusRoute(
      startCoords,
      loc.coordinates,
      originLabel,
      loc.name,
      'WALKING'
    );
    setActiveRoute(route);
    setIsNavigating(true);
    setActiveTab('map');
  };

  const handleSelectEventLocation = (event: CampusEvent) => {
    setSelectedEvent(event);
    setSelectedLocation(null);
    setIsEventsOverlayOpen(false);
    if (activeTab !== 'map') {
      setActiveTab('map');
    }
  };

  const handleNavigateToEvent = (event: CampusEvent) => {
    setSelectedEvent(null);
    const startCoords = userLocation.coords || FUNAAB_NEEDS_HOSTEL;
    const originLabel = userLocation.locationName
      ? userLocation.locationName.replace(' (Simulated)', '')
      : 'My Location';

    const route = calculateCampusRoute(
      startCoords,
      event.coordinates,
      originLabel,
      `${event.title} (${event.locationName})`,
      'WALKING'
    );
    setActiveRoute(route);
    setIsNavigating(true);
    setIsEventsOverlayOpen(false);
    setActiveTab('map');
  };

  const handleEventCreated = (newEvent: CampusEvent) => {
    setEvents((prev) => [...prev, newEvent]);
    setSelectedEvent(newEvent);
    setIsEventsOverlayOpen(false);
    setActiveTab('map');
  };

  const handleRecenterOnUser = () => {
    setSelectedLocation(null);
    triggerRecenter();
    if (!userLocation.isSimulated && !userLocation.active) {
      startRealGeolocation();
    }
  };

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
      libraries={['places', 'marker', 'routes', 'geometry']}
    >
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
        {/* Tier 2 Quota Exceeded In-App Banner */}
        {quotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Global Navigation Header */}
        <HeaderNavbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'tour') {
              setIsTourOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          userLocation={userLocation}
          onToggleSimulateLocation={toggleSimulateLocation}
          onLocateUser={handleRecenterOnUser}
          mapType={mapType}
          setMapType={setMapType}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
          cachedRegionsCount={cachedRegionsCount}
          isOfflineMode={isOfflineMode}
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenEvents={() => setIsEventsOverlayOpen(true)}
          eventsCount={events.length}
          liveEventsCount={events.filter((e) => e.status === 'live').length}
          onOpenLocationCalibrator={() => setIsLocationCalibratorOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onOpenCGPACalculator={() => setIsCGPACalculatorOpen(true)}
          onOpenGoogleWorkspaceSuite={() => handleOpenWorkspace(studyGroups[0])}
          onOpenFreshersGuide={() => setIsFreshersGuideOpen(true)}
        />

        {/* Offline Status Alert Banner if offline or forced offline */}
        {(!isOnline || isOfflineMode) && (
          <div className="bg-amber-600 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-md z-40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>
                {isOfflineMode
                  ? 'Offline Simulation Mode is active. Navigating using cached campus data.'
                  : 'Network disconnected. FUNAAB Map is running in offline mode using cached regions.'}
              </span>
            </div>
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className="underline font-bold hover:text-amber-100"
            >
              Manage Cached Regions
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
          {/* View Mode 1: Interactive Google Map */}
          {activeTab === 'map' && (
            <div className="relative w-full h-full animate-tab-content">
                <CampusMap
                  locations={CAMPUS_LOCATIONS}
                  selectedLocation={selectedLocation}
                  onSelectLocation={handleSelectLocation}
                  activeRoute={activeRoute}
                  userLocation={userLocation}
                  mapType={mapType}
                  isNavigating={isNavigating}
                  highlightedRegion={highlightedRegion}
                  isOfflineMode={isOfflineMode}
                  isApproachingTurn={isApproachingTurn}
                  approachingTurnCoord={approachingTurnCoord}
                  recenterTimestamp={recenterTimestamp}
                  events={events}
                  showEventsOverlay={showEventsOnMap}
                  selectedEvent={selectedEvent}
                  onSelectEvent={(evt) => setSelectedEvent(evt)}
                  onNavigateToEvent={handleNavigateToEvent}
                  onOpenLocationCalibrator={() => setIsLocationCalibratorOpen(true)}
                  studyGroups={studyGroups}
                  showStudyGroupsOnMap={showStudyGroupsOnMap}
                />

              {/* Floating Quick Search & Events Action Bar at top center */}
              <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-auto z-20 flex items-center gap-2 max-w-xl">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex-1 sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-emerald-200 dark:border-slate-800 flex items-center justify-between gap-3 text-slate-500 hover:text-slate-800 dark:hover:text-white transition group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                      Search any building in FUNAAB...
                    </span>
                  </div>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded font-mono text-slate-400">
                    /
                  </kbd>
                </button>

                {/* Quick Events Overlay Pill Button */}
                <button
                  onClick={() => setIsEventsOverlayOpen(true)}
                  className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-3 rounded-2xl shadow-xl border border-emerald-200 dark:border-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex-shrink-0"
                  title="Upcoming Lectures, Hall Meetings & Campus Events"
                >
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    {events.some((e) => e.status === 'live') && (
                      <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    )}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline">Events</span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full text-[10px] font-mono font-bold">
                    {events.length}
                  </span>
                </button>
              </div>

              {/* Floating Action Buttons (Right Side) */}
              <div className="absolute bottom-6 right-4 sm:right-6 z-20 flex flex-col gap-2">
                {/* Freshers Survival Guide Trigger */}
                <button
                  onClick={() => setIsFreshersGuideOpen(true)}
                  title="Open FUNAAB Freshers Survival Guide"
                  className="p-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl shadow-xl border border-amber-300 transition flex items-center justify-center font-bold"
                >
                  <Compass className="w-5 h-5 text-slate-950" />
                </button>

                {/* Events Overlay Quick Trigger */}
                <button
                  onClick={() => setIsEventsOverlayOpen(true)}
                  title="Upcoming Campus Events, Lectures & Meetings"
                  className="p-3 bg-white/95 dark:bg-slate-900/95 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-xl border border-emerald-200 dark:border-slate-800 transition flex items-center justify-center relative"
                >
                  <Calendar className="w-5 h-5 text-amber-500" />
                  {events.some((e) => e.status === 'live') && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </button>

                {/* Offline Maps Quick Access */}
                <button
                  onClick={() => setIsOfflineModalOpen(true)}
                  title="Manage Offline Campus Maps"
                  className={`p-3 rounded-2xl shadow-xl border transition flex items-center justify-center ${
                    isOfflineMode || cachedRegionsCount > 0
                      ? 'bg-amber-500 text-emerald-950 border-amber-300'
                      : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <CloudOff className="w-5 h-5" />
                </button>

                {/* Emergency Lines */}
                <button
                  onClick={() => setShowEmergencyModal(true)}
                  title="Campus Emergency Numbers"
                  className="p-3 bg-white/95 dark:bg-slate-900/95 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-900/50 transition flex items-center justify-center"
                >
                  <PhoneCall className="w-5 h-5" />
                </button>

                {/* Switch to Blueprint Diagram */}
                <button
                  onClick={() => setActiveTab('diagram')}
                  title="View Stylized Campus Blueprint"
                  className="p-3 bg-white/95 dark:bg-slate-900/95 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-xl border border-emerald-200 dark:border-slate-800 transition flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </button>

                {/* Calibrate GPS / Select NEEDS Hostel Button */}
                <button
                  onClick={() => setIsLocationCalibratorOpen(true)}
                  title="Calibrate Location / Select NEEDS Hostel or Real GPS"
                  className="p-3 bg-white/95 dark:bg-slate-900/95 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-xl border border-emerald-200 dark:border-slate-800 transition flex items-center justify-center"
                >
                  <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </button>

                {/* Directions / Route Planner Button */}
                <button
                  onClick={() => setActiveTab('routes')}
                  title="Open Route Planner"
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl transition flex items-center justify-center shadow-emerald-700/30"
                >
                  <RouteIcon className="w-5 h-5" />
                </button>

                {/* Recenter Device GPS */}
                <button
                  onClick={handleRecenterOnUser}
                  title="Center on My Location"
                  className="p-3 bg-white/95 dark:bg-slate-900/95 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 transition flex items-center justify-center"
                >
                  <LocateFixed className="w-5 h-5 text-emerald-600" />
                </button>
              </div>

              {/* Location Detail Drawer */}
              {selectedLocation && !isNavigating && (
                <LocationDetailModal
                  location={selectedLocation}
                  onClose={() => setSelectedLocation(null)}
                  onNavigateToLocation={handleNavigateToLocation}
                  onSetAsCurrentLocation={(loc) => setManualLocation(loc.coordinates, loc.name)}
                  userLocation={userLocation}
                />
              )}

              {/* Live Navigation HUD Banner */}
              {isNavigating && activeRoute && (
                <LiveNavigationHUD
                  route={activeRoute}
                  userLocation={userLocation}
                  onExit={() => {
                    setIsNavigating(false);
                    setIsApproachingTurn(false);
                    setApproachingTurnCoord(null);
                  }}
                  onRecenter={handleRecenterOnUser}
                  onApproachingTurnChange={(approaching, coord) => {
                    setIsApproachingTurn(approaching);
                    setApproachingTurnCoord(coord);
                  }}
                />
              )}
            </div>
          )}

          {/* View Mode 2: Route Planner */}
          {activeTab === 'routes' && (
            <div className="w-full h-full p-4 sm:p-6 overflow-y-auto max-w-4xl mx-auto flex flex-col gap-4 animate-tab-content">
              <RoutePlanner
                userLocation={userLocation}
                selectedLocation={selectedLocation}
                activeRoute={activeRoute}
                setActiveRoute={setActiveRoute}
                isNavigating={isNavigating}
                setIsNavigating={(nav) => {
                  setIsNavigating(nav);
                  if (nav) {
                    setActiveTab('map');
                  }
                }}
                onFocusStep={() => setActiveTab('map')}
              />
            </div>
          )}

          {/* Dedicated Tab View 2: CGPA & Academic Strategy Workspace */}
          {activeTab === 'cgpa_advisor' && (
            <div className="w-full h-full overflow-y-auto animate-tab-content">
              <CGPACalculatorModal
                isOpen={true}
                isEmbedded={true}
                onClose={() => setActiveTab('map')}
              />
            </div>
          )}

          {/* Dedicated Tab View 3: Study Rooms & Google Workspace Hub */}
          {activeTab === 'study_rooms' && (
            <div className="w-full h-full overflow-y-auto animate-tab-content">
              <StudyRoomsSpace
                studyGroups={studyGroups}
                onOpenWorkspaceHub={(group) => {
                  if (group) setActiveWorkspaceGroupId(group.id);
                  setIsWorkspaceOpen(true);
                }}
                onOpenCreateGroupModal={() => setIsEventsOverlayOpen(true)}
              />
            </div>
          )}

          {/* View Mode 3: Building Directory */}
          {activeTab === 'directory' && (
            <div className="w-full h-full p-4 sm:p-6 overflow-y-auto max-w-6xl mx-auto animate-tab-content">
              <BuildingDirectory
                onSelectLocation={handleSelectLocation}
                onNavigateToLocation={handleNavigateToLocation}
                userLocation={userLocation}
              />
            </div>
          )}

          {/* View Mode 4: Stylized Campus Blueprint */}
          {activeTab === 'diagram' && (
            <div className="w-full h-full p-4 sm:p-6 overflow-y-auto max-w-6xl mx-auto animate-tab-content">
              <CampusIllustratedDiagram
                onSelectLocation={handleSelectLocation}
                onNavigateToLocation={handleNavigateToLocation}
              />
            </div>
          )}
        </div>

        {/* Global Autocomplete Search Modal */}
        <SearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectLocation={handleSelectLocation}
          onNavigateToLocation={handleNavigateToLocation}
          userLocation={userLocation}
        />

        {/* Guided Campus Tour Modal */}
        <CampusTourModal
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          onNavigateWaypoint={handleSelectLocation}
          onLeadMe={handleNavigateToLocation}
        />

        {/* Emergency Contacts Modal */}
        {showEmergencyModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-modal-backdrop">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/60 p-5 max-w-md w-full flex flex-col gap-4 animate-modal-content">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-rose-600">
                  <PhoneCall className="w-5 h-5" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    FUNAAB Emergency Contacts
                  </h3>
                </div>
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">University Health Centre</p>
                    <p className="text-[11px] text-slate-400">24/7 Ambulance &amp; Medical Emergency</p>
                  </div>
                  <a
                    href="tel:08030000000"
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                  >
                    Call
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">FUNAAB Security Unit</p>
                    <p className="text-[11px] text-slate-400">Main School Gate Control Post</p>
                  </div>
                  <a
                    href="tel:08031111111"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                  >
                    Call
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Dean of Student Affairs (DSA)</p>
                    <p className="text-[11px] text-slate-400">SUB Complex Helpdesk</p>
                  </div>
                  <a
                    href="tel:08032222222"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
                  >
                    Call
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Offline Campus Regions Manager Modal */}
        <OfflineMapsModal
          isOpen={isOfflineModalOpen}
          onClose={() => {
            setIsOfflineModalOpen(false);
            setCachedRegionsCount(Object.keys(getSavedRegionsMeta()).length);
          }}
          isOfflineMode={isOfflineMode}
          setIsOfflineMode={setIsOfflineMode}
          isOnline={isOnline}
          onHighlightRegion={(region) => {
            setHighlightedRegion(region);
            setActiveTab('map');
          }}
        />

        {/* Campus Events & Lectures Overlay Modal */}
        <CampusEventsOverlay
          events={events}
          isOpen={isEventsOverlayOpen}
          onClose={() => setIsEventsOverlayOpen(false)}
          onSelectEventLocation={handleSelectEventLocation}
          onNavigateToEvent={handleNavigateToEvent}
          showEventsOnMap={showEventsOnMap}
          onToggleShowEventsOnMap={setShowEventsOnMap}
          selectedEventId={selectedEvent?.id || null}
          onSelectEvent={(eventId) => {
            const found = events.find((e) => e.id === eventId) || null;
            setSelectedEvent(found);
          }}
          campusLocations={CAMPUS_LOCATIONS}
          onEventCreated={handleEventCreated}
          studyGroups={studyGroups}
          onStudyGroupCreated={handleStudyGroupCreated}
          onUpdateStudyGroupMembership={handleUpdateStudyGroupMembership}
          onSendMessage={handleSendStudyGroupMessage}
          onOpenWorkspace={handleOpenWorkspace}
          showStudyGroupsOnMap={showStudyGroupsOnMap}
          onToggleShowStudyGroupsOnMap={setShowStudyGroupsOnMap}
        />

        {/* Freshers Survival Guide Modal */}
        <FreshersGuideModal
          isOpen={isFreshersGuideOpen}
          onClose={() => setIsFreshersGuideOpen(false)}
          onSelectLocation={handleSelectLocation}
          onNavigateToLocation={handleNavigateToLocation}
          locations={CAMPUS_LOCATIONS}
          onOpenCGPACalculator={() => {
            setIsFreshersGuideOpen(false);
            setIsCGPACalculatorOpen(true);
          }}
        />

        {/* Location & GPS Calibrator Modal (NEEDS Hostel, School Gate, Real GPS) */}
        <LocationCalibratorModal
          isOpen={isLocationCalibratorOpen}
          onClose={() => setIsLocationCalibratorOpen(false)}
          userLocation={userLocation}
          onSetLocation={(coords, name) => setManualLocation(coords, name)}
          onRefreshRealGps={startRealGeolocation}
          onRecenter={handleRecenterOnUser}
        />

        {/* Install FUNAAB Map as PWA Native App Modal */}
        <AppInstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />

        {/* FUNAAB 5-Point CGPA Calculator Modal */}
        <CGPACalculatorModal
          isOpen={isCGPACalculatorOpen}
          onClose={() => setIsCGPACalculatorOpen(false)}
        />

        {/* Embedded Google Workspace Suite Hub Modal */}
        <GoogleWorkspaceHubModal
          isOpen={isWorkspaceOpen}
          onClose={() => setIsWorkspaceOpen(false)}
          studyGroup={studyGroups.find(g => g.id === activeWorkspaceGroupId) || studyGroups[0] || null}
          studentName={localStorage.getItem('funaab_student_name') || 'FUNAAB Student'}
          onSendMessage={handleSendStudyGroupMessage}
          onAddAnnouncement={handleAddAnnouncement}
          onAddDriveFile={handleAddDriveFile}
          onToggleAssignment={handleToggleAssignment}
        />
      </div>
    </APIProvider>
  );
}
