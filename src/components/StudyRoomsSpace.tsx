import React, { useState } from 'react';
import { 
  Users, 
  Video, 
  MessageSquare, 
  Sparkles, 
  ExternalLink, 
  Plus, 
  BookOpen, 
  Folder, 
  MapPin, 
  Calendar,
  Share2,
  CheckCircle,
  Clock,
  UserPlus
} from 'lucide-react';
import { StudyGroup } from '../types/campus';
import { createGoogleMeetSpace } from '../utils/googleMeetService';
import { createGoogleChatSpace, getGoogleChatUrl } from '../utils/googleChatService';

interface StudyRoomsSpaceProps {
  studyGroups: StudyGroup[];
  onOpenWorkspaceHub: (group?: StudyGroup) => void;
  onOpenCreateGroupModal?: () => void;
}

export const StudyRoomsSpace: React.FC<StudyRoomsSpaceProps> = ({
  studyGroups,
  onOpenWorkspaceHub,
  onOpenCreateGroupModal,
}) => {
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [quickMeetUrl, setQuickMeetUrl] = useState<string | null>(null);
  const [isCreatingQuickMeet, setIsCreatingQuickMeet] = useState(false);
  const [joinedRoomIds, setJoinedRoomIds] = useState<Set<string>>(new Set(['sg-1', 'sg-2']));

  const handleCreateQuickMeet = async () => {
    setIsCreatingQuickMeet(true);
    try {
      const space = await createGoogleMeetSpace('FUNAAB General Study Room');
      setQuickMeetUrl(space.meetingUri);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreatingQuickMeet(false);
    }
  };

  const handleToggleJoinRoom = (roomId: string) => {
    setJoinedRoomIds(prev => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  };

  const filteredGroups = studyGroups.filter(group => {
    if (filterDepartment === 'all') return true;
    return group.department?.toLowerCase().includes(filterDepartment.toLowerCase());
  });

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto max-w-6xl mx-auto space-y-6 animate-tab-content">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-emerald-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase tracking-wider shadow">
                Dedicated Workspace
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-800/80 text-teal-200 border border-teal-600/50">
                Google Workspace Powered
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Users className="w-8 h-8 text-amber-400" />
              FUNAAB Study Rooms & Collaborations
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed">
              Dedicated space for department study rooms, Google Meet video calls, Google Chat groups, and Google Classroom resource sharing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleCreateQuickMeet}
              disabled={isCreatingQuickMeet}
              className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition disabled:opacity-50"
            >
              <Video className="w-4 h-4 text-slate-950" />
              <span>{isCreatingQuickMeet ? 'Creating...' : 'Instant Google Meet'}</span>
            </button>

            <button
              onClick={() => onOpenWorkspaceHub()}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition border border-emerald-400/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Workspace Suite</span>
            </button>
          </div>
        </div>

        {/* Quick Meet Link Alert Banner */}
        {quickMeetUrl && (
          <div className="mt-4 p-3 bg-emerald-950/90 border border-amber-400/60 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-amber-300">Google Meet Ready:</span>
              <a href={quickMeetUrl} target="_blank" rel="noopener noreferrer" className="underline text-emerald-200 hover:text-white truncate font-mono">
                {quickMeetUrl}
              </a>
            </div>
            <a
              href={quickMeetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-amber-400 text-slate-950 rounded-xl font-bold flex items-center gap-1 shadow"
            >
              <span>Join Now</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterDepartment('all')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              filterDepartment === 'all'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Courses ({studyGroups.length})
          </button>
          <button
            onClick={() => setFilterDepartment('General')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              filterDepartment === 'General'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            100L General Courses
          </button>
          <button
            onClick={() => setFilterDepartment('Agriculture')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              filterDepartment === 'Agriculture'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            COLAMR / COLPLANT
          </button>
        </div>

        {onOpenCreateGroupModal && (
          <button
            onClick={onOpenCreateGroupModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Study Group</span>
          </button>
        )}
      </div>

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => {
          const isJoined = joinedRoomIds.has(group.id);

          return (
            <div
              key={group.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {group.courseCode}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    {group.membersCount + (isJoined ? 1 : 0)} Members
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                  {group.courseTitle}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {group.description || 'Group revision, tutorial discussions, past question practice, and Google Meet video study.'}
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="truncate">{group.locationName || 'Nimbe Adedipe Library'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span>{group.meetingTime || 'Daily 4:00 PM - 6:00 PM'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleToggleJoinRoom(group.id)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      isJoined
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Joined</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Join Room</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onOpenWorkspaceHub(group)}
                    className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Meet & Chat</span>
                  </button>
                </div>

                {group.googleMeetUrl && (
                  <a
                    href={group.googleMeetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 transition"
                  >
                    <span>Launch Attached Google Meet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
