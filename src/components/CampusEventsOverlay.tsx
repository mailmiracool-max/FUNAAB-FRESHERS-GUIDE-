import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Navigation, 
  Radio, 
  Search, 
  X, 
  Filter, 
  GraduationCap, 
  Home, 
  Lightbulb, 
  Award, 
  Trophy, 
  Users, 
  Plus, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Flame,
  Info,
  BookOpen,
  UserPlus,
  UserCheck,
  MessageSquare,
  Send,
  CalendarPlus,
  Download,
  Check
} from 'lucide-react';
import { CampusEvent, EventCategory, CampusLocation, StudyGroup } from '../types/campus';
import { EVENT_CATEGORY_CONFIG, saveCustomCampusEvent } from '../data/campusEvents';
import { getGoogleCalendarUrl, downloadICalendarFile } from '../utils/calendarExporter';

interface CampusEventsOverlayProps {
  events: CampusEvent[];
  isOpen: boolean;
  onClose: () => void;
  onSelectEventLocation: (event: CampusEvent) => void;
  onNavigateToEvent: (event: CampusEvent) => void;
  showEventsOnMap: boolean;
  onToggleShowEventsOnMap: (show: boolean) => void;
  selectedEventId: string | null;
  onSelectEvent: (eventId: string | null) => void;
  campusLocations: CampusLocation[];
  onEventCreated?: (newEvent: CampusEvent) => void;
  studyGroups?: StudyGroup[];
  onStudyGroupCreated?: (group: StudyGroup) => void;
  onUpdateStudyGroupMembership?: (groupId: string, studentName: string, join: boolean) => void;
  onSendMessage?: (groupId: string, sender: string, text: string) => void;
  onOpenWorkspace?: (group: StudyGroup) => void;
  showStudyGroupsOnMap?: boolean;
  onToggleShowStudyGroupsOnMap?: (show: boolean) => void;
}

export const CampusEventsOverlay: React.FC<CampusEventsOverlayProps> = ({
  events,
  isOpen,
  onClose,
  onSelectEventLocation,
  onNavigateToEvent,
  showEventsOnMap,
  onToggleShowEventsOnMap,
  selectedEventId,
  onSelectEvent,
  campusLocations,
  onEventCreated,
  studyGroups = [],
  onStudyGroupCreated,
  onUpdateStudyGroupMembership,
  onSendMessage,
  onOpenWorkspace,
  showStudyGroupsOnMap = true,
  onToggleShowStudyGroupsOnMap,
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'study_groups'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'live' | 'today' | 'upcoming'>('all');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isCreatingStudyGroup, setIsCreatingStudyGroup] = useState(false);
  const [activeChatGroupId, setActiveChatGroupId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [openExportId, setOpenExportId] = useState<string | null>(null);
  const [downloadNoticeId, setDownloadNoticeId] = useState<string | null>(null);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EventCategory>('lecture');
  const [newLocationId, setNewLocationId] = useState(campusLocations[0]?.id || '1k_cap');
  const [newVenueDetail, setNewVenueDetail] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('');
  const [newDateStr, setNewDateStr] = useState('Today');
  const [newTimeStr, setNewTimeStr] = useState('02:00 PM - 04:00 PM');
  const [newAudience, setNewAudience] = useState('All Students');
  const [newDesc, setNewDesc] = useState('');
  const [newSpeaker, setNewSpeaker] = useState('');

  // New Study Group Form State
  const [sgCourseCode, setSgCourseCode] = useState('');
  const [sgCourseTitle, setSgCourseTitle] = useState('');
  const [sgLocationId, setSgLocationId] = useState(() => {
    const lib = campusLocations.find(l => l.id.includes('library') || l.category === 'academic');
    return lib ? lib.id : campusLocations[0]?.id || 'nimbe_library';
  });
  const [sgTimeStr, setSgTimeStr] = useState('Today, 04:00 PM - 06:00 PM');
  const [sgMaxMembers, setSgMaxMembers] = useState<number>(10);
  const [sgTopic, setSgTopic] = useState('');
  const [sgOrganizer, setSgOrganizer] = useState('');
  const [sgGoogleMeet, setSgGoogleMeet] = useState('');
  const [sgGoogleClassroom, setSgGoogleClassroom] = useState('');
  const [myStudentName, setMyStudentName] = useState(() => {
    try {
      return localStorage.getItem('funaab_student_name') || 'Student (' + (Math.floor(Math.random() * 899 + 100)) + ')';
    } catch (e) {
      return 'FUNAAB Student';
    }
  });

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (selectedCategory !== 'all' && evt.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus === 'live' && evt.status !== 'live') return false;
      if (selectedStatus === 'today' && !evt.dateStr.toLowerCase().includes('today')) return false;
      if (selectedStatus === 'upcoming' && evt.status !== 'upcoming') return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = evt.title.toLowerCase().includes(query);
        const matchesLocation = evt.locationName.toLowerCase().includes(query);
        const matchesVenue = evt.venueDetail.toLowerCase().includes(query);
        const matchesOrganizer = evt.organizer.toLowerCase().includes(query);
        const matchesAudience = evt.targetAudience.toLowerCase().includes(query);
        const matchesDesc = evt.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation && !matchesVenue && !matchesOrganizer && !matchesAudience && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [events, selectedCategory, selectedStatus, searchQuery]);

  // Filter study groups
  const filteredStudyGroups = useMemo(() => {
    return studyGroups.filter((sg) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        sg.courseCode.toLowerCase().includes(query) ||
        sg.courseTitle.toLowerCase().includes(query) ||
        sg.locationName.toLowerCase().includes(query) ||
        sg.topic.toLowerCase().includes(query) ||
        sg.organizer.toLowerCase().includes(query)
      );
    });
  }, [studyGroups, searchQuery]);

  const liveEventsCount = useMemo(() => {
    return events.filter((e) => e.status === 'live').length;
  }, [events]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const loc = campusLocations.find((l) => l.id === newLocationId) || campusLocations[0];
    const catConfig = EVENT_CATEGORY_CONFIG[newCategory];

    const created: CampusEvent = {
      id: `evt_user_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      locationId: loc.id,
      locationName: loc.name,
      venueDetail: newVenueDetail.trim() || `${loc.name} Auditorium`,
      coordinates: loc.coordinates,
      organizer: newOrganizer.trim() || 'Student Organized',
      dateStr: newDateStr,
      timeStr: newTimeStr,
      status: newDateStr.toLowerCase().includes('today') ? 'live' : 'upcoming',
      targetAudience: newAudience.trim() || 'Campus Community',
      description: newDesc.trim() || 'No description provided.',
      speakerOrChair: newSpeaker.trim() || undefined,
      badgeColor: catConfig.color,
    };

    saveCustomCampusEvent(created);
    onEventCreated?.(created);
    setIsCreatingEvent(false);

    setNewTitle('');
    setNewVenueDetail('');
    setNewOrganizer('');
    setNewDesc('');
    setNewSpeaker('');
  };

  const handleStudyGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sgCourseCode.trim()) return;

    const loc = campusLocations.find((l) => l.id === sgLocationId) || campusLocations[0];
    const organizerName = sgOrganizer.trim() || myStudentName;

    const newGroup: StudyGroup = {
      id: `sg_${Date.now()}`,
      courseCode: sgCourseCode.toUpperCase().trim(),
      courseTitle: sgCourseTitle.trim() || 'Course Study & Revision',
      locationId: loc.id,
      locationName: loc.name,
      coordinates: loc.coordinates,
      organizer: organizerName,
      timeStr: sgTimeStr.trim() || 'Today, 04:00 PM',
      maxMembers: Number(sgMaxMembers) || 12,
      membersCount: 1,
      members: [organizerName],
      topic: sgTopic.trim() || 'Past questions review and collaborative problem solving.',
      badgeColor: '#10B981',
      googleMeetUrl: sgGoogleMeet.trim() || undefined,
      googleClassroomCode: sgGoogleClassroom.trim() || undefined,
    };

    try {
      localStorage.setItem('funaab_student_name', organizerName);
    } catch (e) {}

    onStudyGroupCreated?.(newGroup);
    setIsCreatingStudyGroup(false);

    setSgCourseCode('');
    setSgCourseTitle('');
    setSgTopic('');
    setSgOrganizer('');
    setSgGoogleMeet('');
    setSgGoogleClassroom('');
  };

  const getCategoryIcon = (category: EventCategory) => {
    switch (category) {
      case 'lecture':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'hall_meeting':
        return <Home className="w-3.5 h-3.5" />;
      case 'seminar':
        return <Lightbulb className="w-3.5 h-3.5" />;
      case 'ceremony':
        return <Award className="w-3.5 h-3.5" />;
      case 'sports':
        return <Trophy className="w-3.5 h-3.5" />;
      case 'student_union':
        return <Users className="w-3.5 h-3.5" />;
      default:
        return <Calendar className="w-3.5 h-3.5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-modal-backdrop">
      <div 
        className="bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="events-dialog-title"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white px-5 sm:px-6 py-4 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="events-dialog-title" className="text-base sm:text-lg font-bold">
                  FUNAAB Campus Events & Study Hub
                </h2>
                {liveEventsCount > 0 && activeTab === 'events' && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    {liveEventsCount} Live
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/90 hidden sm:block">
                Discover lectures, student congresses, and join course study groups at library & faculty venues
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Map Overlay Toggle Button */}
            <button
              onClick={() => {
                if (activeTab === 'events') {
                  onToggleShowEventsOnMap(!showEventsOnMap);
                } else {
                  onToggleShowStudyGroupsOnMap?.(!showStudyGroupsOnMap);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                (activeTab === 'events' ? showEventsOnMap : showStudyGroupsOnMap)
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-bold'
                  : 'bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 border-emerald-600/50'
              }`}
              title="Toggle glowing pins on the campus map"
            >
              <Radio className={`w-3.5 h-3.5 ${((activeTab === 'events' ? showEventsOnMap : showStudyGroupsOnMap)) ? 'animate-pulse text-slate-950' : 'text-emerald-300'}`} />
              <span className="hidden sm:inline">Map Pins:</span>
              <span>{(activeTab === 'events' ? showEventsOnMap : showStudyGroupsOnMap) ? 'Active' : 'Off'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-emerald-900/60 hover:bg-rose-900/70 text-emerald-100 hover:text-white transition"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Search Toolbar */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-800/80 p-1 rounded-2xl">
              <button
                onClick={() => { setActiveTab('events'); setIsCreatingStudyGroup(false); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'events'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Campus Events ({events.length})</span>
              </button>

              <button
                onClick={() => { setActiveTab('study_groups'); setIsCreatingEvent(false); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'study_groups'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Study Groups ({studyGroups.length})</span>
              </button>
            </div>

            {/* Create Action Button */}
            {activeTab === 'events' ? (
              <button
                onClick={() => setIsCreatingEvent(!isCreatingEvent)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>{isCreatingEvent ? 'Cancel' : 'Post Campus Event'}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCreatingStudyGroup(!isCreatingStudyGroup)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isCreatingStudyGroup ? 'Cancel' : 'Create Study Group'}</span>
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'events'
                  ? "Search lectures, hall meetings, seminars, or venues..."
                  : "Search study groups by course code (e.g. MTH 211), topic, or library/faculty..."
              }
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills (Events Tab) */}
          {activeTab === 'events' && !isCreatingEvent && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                All Events
              </button>
              {(Object.keys(EVENT_CATEGORY_CONFIG) as EventCategory[]).map((cat) => {
                const cfg = EVENT_CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      selectedCategory === cat
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{getCategoryIcon(cat)}</span>
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Body: Content Scrollable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-950/30">
          {/* Create Event Form Drawer */}
          {activeTab === 'events' && isCreatingEvent && (
            <form onSubmit={handleCreateSubmit} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-500/30 shadow-lg flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Post New Campus Event / Lecture
                </h3>
                <span className="text-[10px] text-slate-400">Broadcasts to all students instantly</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Event Title / Course Name *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. MTH 211 Mid-Semester Tutorial"
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="lecture">📚 Lecture / Tutorial</option>
                    <option value="hall_meeting">🏛️ Hall Meeting / Congress</option>
                    <option value="seminar">💡 Seminar / Tech Expo</option>
                    <option value="ceremony">🎓 University Ceremony</option>
                    <option value="sports">⚽ Sports / Dean's Cup</option>
                    <option value="student_union">👥 Student Union (SUG)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Campus Venue / Location</label>
                  <select
                    value={newLocationId}
                    onChange={(e) => setNewLocationId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    {campusLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.fullName})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Hall / Room Detail</label>
                  <input
                    type="text"
                    value={newVenueDetail}
                    onChange={(e) => setNewVenueDetail(e.target.value)}
                    placeholder="e.g. Lecture Theatre Hall B"
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Organizer / Department</label>
                  <input
                    type="text"
                    value={newOrganizer}
                    onChange={(e) => setNewOrganizer(e.target.value)}
                    placeholder="e.g. Department of Agricultural Economics"
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Date</label>
                  <input
                    type="text"
                    value={newDateStr}
                    onChange={(e) => setNewDateStr(e.target.value)}
                    placeholder="Today, Tomorrow, or Friday"
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Time Schedule</label>
                  <input
                    type="text"
                    value={newTimeStr}
                    onChange={(e) => setNewTimeStr(e.target.value)}
                    placeholder="02:00 PM - 04:00 PM"
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Target Audience</label>
                  <input
                    type="text"
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    placeholder="e.g. 200 Level Agriculture Students"
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Description & Agenda</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide brief details about the event, reading materials, or instructions..."
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingEvent(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                >
                  Publish Event
                </button>
              </div>
            </form>
          )}

          {/* Create Study Group Form Drawer */}
          {activeTab === 'study_groups' && isCreatingStudyGroup && (
            <form onSubmit={handleStudyGroupSubmit} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-500/30 shadow-lg flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  Create Course Study Group (Library / Faculty Venue)
                </h3>
                <span className="text-[10px] text-slate-400">Visible as map marker</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={sgCourseCode}
                    onChange={(e) => setSgCourseCode(e.target.value)}
                    placeholder="e.g. MTH 211 or CHM 201"
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Study Topic / Focus</label>
                  <input
                    type="text"
                    value={sgCourseTitle}
                    onChange={(e) => setSgCourseTitle(e.target.value)}
                    placeholder="e.g. Calculus & Past Questions Review"
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Library / Faculty Venue *</label>
                  <select
                    value={sgLocationId}
                    onChange={(e) => setSgLocationId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    {campusLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.fullName})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Meeting Time</label>
                  <input
                    type="text"
                    value={sgTimeStr}
                    onChange={(e) => setSgTimeStr(e.target.value)}
                    placeholder="Today, 04:00 PM - 06:00 PM"
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Max Group Size</label>
                  <select
                    value={sgMaxMembers}
                    onChange={(e) => setSgMaxMembers(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value={5}>5 Students (Intimate)</option>
                    <option value={10}>10 Students</option>
                    <option value={15}>15 Students</option>
                    <option value={20}>20 Students (Large)</option>
                    <option value={30}>30 Students (Hall)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Your Name (Organizer)</label>
                  <input
                    type="text"
                    value={sgOrganizer}
                    onChange={(e) => setSgOrganizer(e.target.value)}
                    placeholder={myStudentName}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Study Details / Agenda</label>
                <textarea
                  rows={2}
                  value={sgTopic}
                  onChange={(e) => setSgTopic(e.target.value)}
                  placeholder="What chapters or past questions are you tackling? e.g. Chapters 3 & 4 past questions..."
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Google Meet URL (Optional Video Link)
                  </label>
                  <input
                    type="url"
                    value={sgGoogleMeet}
                    onChange={(e) => setSgGoogleMeet(e.target.value)}
                    placeholder="https://meet.google.com/xyz-abcd-efg"
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono text-[11px]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Google Classroom Code / Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={sgGoogleClassroom}
                    onChange={(e) => setSgGoogleClassroom(e.target.value)}
                    placeholder="e.g. mth211-funaab-2026 or class link"
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingStudyGroup(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                >
                  Create Study Group
                </button>
              </div>
            </form>
          )}

          {/* TAB 1: CAMPUS EVENTS */}
          {activeTab === 'events' && (
            <div className="flex flex-col gap-3">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  No campus events found matching your search or category filter.
                </div>
              ) : (
                filteredEvents.map((evt) => {
                  const isLive = evt.status === 'live';
                  const isSelected = selectedEventId === evt.id;
                  const cfg = EVENT_CATEGORY_CONFIG[evt.category];

                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt.id)}
                      className={`p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-400/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md font-bold text-base"
                          style={{ backgroundColor: evt.badgeColor || cfg.color }}
                        >
                          {getCategoryIcon(evt.category)}
                        </div>

                        <div className="min-w-0 flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isLive && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                Live Now
                              </span>
                            )}
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                              {cfg.label}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {evt.dateStr} • {evt.timeStr}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {evt.title}
                          </h3>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                            {evt.description}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{evt.locationName}</span>
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {evt.venueDetail}
                            </span>
                            {evt.targetAudience && (
                              <>
                                <span className="text-slate-400">•</span>
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                  {evt.targetAudience}
                                </span>
                              </>
                            )}
                          </div>

                          {(evt.speakerOrChair || evt.organizer) && (
                            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 italic">
                              Organized by: <span className="font-medium not-italic">{evt.organizer}</span>
                              {evt.speakerOrChair && ` • Chair: ${evt.speakerOrChair}`}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col items-center gap-2 flex-shrink-0 pt-2 sm:pt-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEventLocation(evt);
                          }}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View on Map</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToEvent(evt);
                          }}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition"
                        >
                          <Navigation className="w-3.5 h-3.5 text-amber-300" />
                          <span>Navigate</span>
                        </button>

                        {/* Calendar Export Popover Button */}
                        <div className="relative flex-1 sm:flex-initial">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenExportId(openExportId === evt.id ? null : evt.id);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition"
                            title="Export event to Google Calendar or Apple Calendar (.ics)"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 text-slate-950" />
                            <span>Add to Calendar</span>
                          </button>

                          {openExportId === evt.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full sm:top-auto sm:bottom-0 sm:right-full sm:mr-2 mt-1 sm:mt-0 z-40 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-500/30 p-2 flex flex-col gap-1 text-xs animate-modal-content"
                            >
                              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                Select Device Calendar
                              </div>

                              <a
                                href={getGoogleCalendarUrl(evt)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpenExportId(null)}
                                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition"
                              >
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>Google Calendar</span>
                                <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                              </a>

                              <button
                                onClick={() => {
                                  downloadICalendarFile(evt);
                                  setOpenExportId(null);
                                  setDownloadNoticeId(evt.id);
                                  setTimeout(() => setDownloadNoticeId(null), 3000);
                                }}
                                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/60 hover:text-amber-800 dark:hover:text-amber-300 font-medium transition text-left"
                              >
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span>Apple / Device (.ics)</span>
                                <Download className="w-3 h-3 ml-auto text-slate-400" />
                              </button>
                            </div>
                          )}

                          {downloadNoticeId === evt.id && (
                            <div className="absolute right-0 top-full mt-1 z-50 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md whitespace-nowrap animate-modal-content">
                              <Check className="w-3 h-3" />
                              <span>Downloaded .ics calendar file!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: STUDY GROUPS */}
          {activeTab === 'study_groups' && (
            <div className="flex flex-col gap-3">
              {filteredStudyGroups.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  No study groups found. Create one above to invite students for your course!
                </div>
              ) : (
                filteredStudyGroups.map((sg) => {
                  const isMember = sg.members.includes(myStudentName);
                  const isFull = sg.membersCount >= sg.maxMembers;

                  return (
                    <div
                      key={sg.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm font-mono shadow-md flex-shrink-0">
                          📖
                        </div>

                        <div className="min-w-0 flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black font-mono text-xs">
                              {sg.courseCode}
                            </span>
                            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                              {sg.membersCount} / {sg.maxMembers} Students Joined
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {sg.timeStr}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {sg.courseTitle}
                          </h3>

                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {sg.topic}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{sg.locationName}</span>
                            </span>
                            <span className="text-slate-400">•</span>
                            <span>Organized by: <strong className="text-slate-700 dark:text-slate-300">{sg.organizer}</strong></span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 flex-wrap">
                            <span>Members:</span>
                            {sg.members.map((m, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                                {m}
                              </span>
                            ))}
                          </div>

                          {/* Google Meet & Classroom Integration Badges/Links */}
                          {(sg.googleMeetUrl || sg.googleClassroomCode) && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                              {sg.googleMeetUrl && (
                                <a
                                  href={sg.googleMeetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-900 transition shadow-sm"
                                  title="Join Google Meet virtual study room"
                                >
                                  <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 10.5V5c0-1.1-.9-2-2-2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5.5l4 4v-11l-4 4zM5 19V5h12v14H5z"/>
                                  </svg>
                                  <span>Join Google Meet</span>
                                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                                </a>
                              )}

                              {sg.googleClassroomCode && (
                                sg.googleClassroomCode.startsWith('http://') || sg.googleClassroomCode.startsWith('https://') ? (
                                  <a
                                    href={sg.googleClassroomCode}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-900 transition shadow-sm"
                                    title="Open Google Classroom link"
                                  >
                                    <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm0 15v-3l2.5-1.5L11 16v3H6zm12 0h-5v-3l2.5-1.5L18 16v3zm0-5h-5V4h5v10z"/>
                                    </svg>
                                    <span>Open Classroom</span>
                                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                                  </a>
                                ) : (
                                  <a
                                    href={`https://classroom.google.com/c/${sg.googleClassroomCode.trim()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-900 transition shadow-sm"
                                    title="Open Google Classroom with code"
                                  >
                                    <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm0 15v-3l2.5-1.5L11 16v3H6zm12 0h-5v-3l2.5-1.5L18 16v3zm0-5h-5V4h5v10z"/>
                                    </svg>
                                    <span>Classroom:</span>
                                    <span className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200 border border-amber-300/50">
                                      {sg.googleClassroomCode}
                                    </span>
                                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                                  </a>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Join / Leave, Chat & Google Workspace Actions */}
                      <div className="flex sm:flex-col items-center gap-2 flex-shrink-0 pt-2 sm:pt-0">
                        <button
                          onClick={() => onOpenWorkspace?.(sg)}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-sm"
                          title="Open Google Workspace Suite (Classroom, Meet, Drive, Docs, Calendar)"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                          <span>Google Workspace</span>
                        </button>

                        <button
                          onClick={() => setActiveChatGroupId(sg.id)}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition shadow-sm"
                          title="Open live study group chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          <span>Chat ({sg.messages?.length || 0})</span>
                        </button>

                        {isMember ? (
                          <button
                            onClick={() => onUpdateStudyGroupMembership?.(sg.id, myStudentName, false)}
                            className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800 hover:bg-rose-100 hover:text-rose-800 transition"
                            title="Click to leave study group"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Joined (Leave)</span>
                          </button>
                        ) : (
                          <button
                            disabled={isFull}
                            onClick={() => {
                              const nameInput = prompt('Enter your name & level (e.g. David - 300L COLENG):', myStudentName);
                              if (nameInput) {
                                setMyStudentName(nameInput);
                                onUpdateStudyGroupMembership?.(sg.id, nameInput, true);
                              }
                            }}
                            className={`w-full sm:w-auto flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                              isFull
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/20'
                            }`}
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>{isFull ? 'Group Full' : 'Join Group'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Real-Time Study Group Chat Modal Sub-drawer */}
        {activeChatGroupId && (() => {
          const activeGroup = studyGroups.find(g => g.id === activeChatGroupId);
          if (!activeGroup) return null;
          const isMemberOfActive = activeGroup.members.includes(myStudentName);

          return (
            <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold font-mono text-sm">
                      💬
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-black">
                          {activeGroup.courseCode}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {activeGroup.courseTitle}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{activeGroup.locationName}</span> • <strong className="text-emerald-600">{activeGroup.membersCount} Members</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveChatGroupId(null)}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-950/50">
                  {(!activeGroup.messages || activeGroup.messages.length === 0) ? (
                    <div className="text-center py-16 text-slate-400 text-xs">
                      No messages yet. Start the conversation with your study group!
                    </div>
                  ) : (
                    activeGroup.messages.map((msg) => {
                      const isMe = msg.sender === myStudentName;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400 font-medium">
                            <span>{msg.sender}</span>
                            <span>•</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Input Footer */}
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                  {isMemberOfActive ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!chatInputText.trim()) return;
                        onSendMessage?.(activeGroup.id, myStudentName, chatInputText.trim());
                        setChatInputText('');
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={chatInputText}
                        onChange={(e) => setChatInputText(e.target.value)}
                        placeholder={`Message ${activeGroup.courseCode} study group as ${myStudentName}...`}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition flex-shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200">
                      <span>You must join this study group to participate in the chat.</span>
                      <button
                        onClick={() => {
                          const nameInput = prompt('Enter your name & level:', myStudentName);
                          if (nameInput) {
                            setMyStudentName(nameInput);
                            onUpdateStudyGroupMembership?.(activeGroup.id, nameInput, true);
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                      >
                        Join Group
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Footer info */}
        <div className="p-3 bg-slate-100 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-500" />
            <span>Study groups are automatically displayed as live markers at library & faculty venues on the map.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
