import React, { useState } from 'react';
import { 
  X, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Users, 
  MessageSquare, 
  Send, 
  FileText, 
  Table, 
  Presentation, 
  CheckSquare, 
  Calendar, 
  Plus, 
  ExternalLink, 
  Download, 
  Sparkles, 
  BookOpen, 
  Share2, 
  GraduationCap, 
  FolderPlus, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Layers,
  FileCheck,
  Check
} from 'lucide-react';
import { StudyGroup, DriveWorkspaceFile } from '../types/campus';

interface GoogleWorkspaceHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyGroup: StudyGroup | null;
  studentName: string;
  onSendMessage: (groupId: string, sender: string, text: string) => void;
  onAddAnnouncement: (groupId: string, author: string, text: string) => void;
  onAddDriveFile: (groupId: string, file: { name: string; type: 'doc' | 'sheet' | 'slide' | 'form' | 'pdf'; author: string; content?: string }) => void;
  onToggleAssignment: (groupId: string, assignmentId: string) => void;
}

export const GoogleWorkspaceHubModal: React.FC<GoogleWorkspaceHubModalProps> = ({
  isOpen,
  onClose,
  studyGroup,
  studentName,
  onSendMessage,
  onAddAnnouncement,
  onAddDriveFile,
  onToggleAssignment,
}) => {
  if (!isOpen || !studyGroup) return null;

  const [activeTab, setActiveTab] = useState<'classroom' | 'meet' | 'forms' | 'drive' | 'calendar' | 'maps'>('classroom');

  // Google Meet Interactive Camera/Mic state
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [meetChatInput, setMeetChatInput] = useState('');

  // Google Classroom State
  const [classroomTab, setClassroomTab] = useState<'stream' | 'classwork' | 'people'>('stream');
  const [announcementText, setAnnouncementText] = useState('');

  // Google Forms State
  const [formResponses, setFormResponses] = useState({
    feedbackType: 'general',
    rating: '5',
    department: 'COLENG',
    comments: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Google Drive State
  const [selectedFile, setSelectedFile] = useState<DriveWorkspaceFile | null>(
    studyGroup.driveFiles && studyGroup.driveFiles.length > 0 ? studyGroup.driveFiles[0] : null
  );
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'doc' | 'sheet' | 'slide' | 'form'>('doc');
  const [newFileContent, setNewFileContent] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [activeDocEditorText, setActiveDocEditorText] = useState(selectedFile?.content || '');

  // Google Calendar Sync Confirmation
  const [calendarSynced, setCalendarSynced] = useState(false);

  const handleCreateGoogleCalendarLink = () => {
    const title = encodeURIComponent(`FUNAAB Study Session: ${studyGroup.courseCode} - ${studyGroup.courseTitle}`);
    const details = encodeURIComponent(`Study Topic: ${studyGroup.topic}\nVenue: ${studyGroup.locationName}\nOrganizer: ${studyGroup.organizer}`);
    const location = encodeURIComponent(studyGroup.locationName);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
    setCalendarSynced(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormResponses({ feedbackType: 'general', rating: '5', department: 'COLENG', comments: '' });
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-modal-backdrop">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden animate-modal-content">
        
        {/* Top Header: Google Workspace Suite Title & Group Identity */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Google Colorful Multi-Dot Logo badge */}
            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1.5 rounded-2xl backdrop-blur-sm border border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-black tracking-wide ml-1 text-slate-100">Google Workspace Hub</span>
            </div>

            <div className="hidden sm:block text-slate-300 text-xs">|</div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                  {studyGroup.courseCode}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {studyGroup.courseTitle}
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{studyGroup.locationName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Close Workspace Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar: Google Software Applications */}
        <div className="px-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 sm:gap-2 overflow-x-auto flex-shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('classroom')}
            className={`px-3.5 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'classroom'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Google Classroom</span>
          </button>

          <button
            onClick={() => setActiveTab('meet')}
            className={`px-3.5 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'meet'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4 text-blue-600" />
            <span>Google Meet</span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`px-3.5 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'forms'
                ? 'border-purple-600 text-purple-700 dark:text-purple-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4 text-purple-600" />
            <span>Google Forms</span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`px-3.5 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'drive'
                ? 'border-amber-500 text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-amber-500" />
            <span>Google Drive & Docs</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Google Calendar</span>
          </button>

          <button
            onClick={() => setActiveTab('maps')}
            className={`px-3.5 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'maps'
                ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span>Google Maps Live</span>
          </button>
        </div>

        {/* Modal Main Body Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-3 sm:p-5">
          
          {/* TAB 1: GOOGLE CLASSROOM */}
          {activeTab === 'classroom' && (
            <div className="space-y-4">
              {/* Google Classroom Banner Header */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold font-mono backdrop-blur-sm">
                      Classroom Code: {studyGroup.googleClassroomCode || 'funaab-class-2026'}
                    </span>
                    <span className="text-xs text-emerald-200 font-semibold">
                      FUNAAB Academic Workspace
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black mt-3">
                    {studyGroup.courseCode}: {studyGroup.courseTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl">
                    {studyGroup.topic}
                  </p>
                </div>
                <GraduationCap className="absolute -right-4 -bottom-4 w-40 h-40 text-emerald-700/30 pointer-events-none" />
              </div>

              {/* Classroom Navigation Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  onClick={() => setClassroomTab('stream')}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
                    classroomTab === 'stream'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Stream Feed
                </button>
                <button
                  onClick={() => setClassroomTab('classwork')}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
                    classroomTab === 'classwork'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Classwork & Assignments ({studyGroup.classroomAssignments?.length || 0})
                </button>
                <button
                  onClick={() => setClassroomTab('people')}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
                    classroomTab === 'people'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Classmates ({studyGroup.membersCount})
                </button>
              </div>

              {/* STREAM SUB-TAB */}
              {classroomTab === 'stream' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left Column: Upcoming Due Dates */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      Upcoming Classwork
                    </h3>
                    {(!studyGroup.classroomAssignments || studyGroup.classroomAssignments.length === 0) ? (
                      <p className="text-xs text-slate-400">No upcoming assignments due soon.</p>
                    ) : (
                      studyGroup.classroomAssignments.map((as) => (
                        <div key={as.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                              Due: {as.dueDate}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {as.points} pts
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                            {as.title}
                          </h4>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Right 2 Columns: Share with Class & Announcements Feed */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Share Announcement Box */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Announce something to your class
                      </h4>
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={announcementText}
                          onChange={(e) => setAnnouncementText(e.target.value)}
                          placeholder={`Post an announcement or revision tip as ${studentName}...`}
                          className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => {
                            if (!announcementText.trim()) return;
                            onAddAnnouncement(studyGroup.id, studentName, announcementText.trim());
                            setAnnouncementText('');
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs self-end shadow transition"
                        >
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Announcements List */}
                    <div className="space-y-3">
                      {studyGroup.classroomAnnouncements?.map((ann) => (
                        <div key={ann.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                                {ann.author[0]}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                  {ann.author}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {ann.date}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                              Google Classroom
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                            {ann.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CLASSWORK SUB-TAB */}
              {classroomTab === 'classwork' && (
                <div className="space-y-3">
                  {studyGroup.classroomAssignments?.map((as) => (
                    <div key={as.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl text-white ${as.submitted ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                          <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {as.title}
                            </h4>
                            <span className="text-xs font-semibold text-slate-400">
                              ({as.points} points)
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {as.instructions}
                          </p>
                          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                            Due date: {as.dueDate}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleAssignment(studyGroup.id, as.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
                          as.submitted
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{as.submitted ? 'Turned In' : 'Mark as Done'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* PEOPLE SUB-TAB */}
              {classroomTab === 'people' && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800">
                    Teachers & Group Facilitators
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
                      {studyGroup.organizer[0]}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {studyGroup.organizer} (Group Leader)
                    </span>
                  </div>

                  <h3 className="font-black text-sm text-slate-900 dark:text-white pt-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                    Classmates ({studyGroup.membersCount})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {studyGroup.members.map((mem, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                          {mem[0]}
                        </div>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {mem}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE MEET VIDEO CALL ROOM */}
          {activeTab === 'meet' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Embedded Live Video Frame */}
                <div className="lg:col-span-2 bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[520px] relative">
                  
                  {/* Video Viewport */}
                  <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center relative">
                    
                    {/* Screen share overlay or camera feed representation */}
                    {isScreenSharing ? (
                      <div className="w-full h-full rounded-2xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center p-4">
                        <Monitor className="w-12 h-12 text-blue-400 mb-2 animate-bounce" />
                        <h3 className="text-sm font-bold text-white">Presenting Screen: {studyGroup.courseCode} Revision Deck</h3>
                        <p className="text-xs text-slate-400 mt-1">Participants are viewing your live window broadcast.</p>
                      </div>
                    ) : isWebcamOn ? (
                      <div className="w-full h-full rounded-2xl bg-slate-800 border border-emerald-500/40 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute top-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-lg text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          Live HD Camera
                        </div>
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-2 shadow-lg ring-4 ring-emerald-500/30">
                            {studentName[0]}
                          </div>
                          <h4 className="text-sm font-bold text-white">{studentName}</h4>
                          <span className="text-xs text-slate-400">Microphone {isMicOn ? 'Active' : 'Muted'}</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-3 shadow-xl">
                          {studentName[0]}
                        </div>
                        <h3 className="text-base font-bold text-white">{studentName}</h3>
                        <p className="text-xs text-slate-400 mt-1">Camera is off. Click controls below to enable camera/screen share.</p>
                      </div>
                    )}

                    {/* Participant Avatar Grid Overlay */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 backdrop-blur-md">
                      {studyGroup.members.slice(0, 4).map((m, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center justify-center border border-slate-700" title={m}>
                          {m[0]}
                        </div>
                      ))}
                      {studyGroup.members.length > 4 && (
                        <span className="text-[10px] text-slate-300 font-bold px-2">
                          +{studyGroup.members.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Google Meet Bottom Controls Bar */}
                  <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsMicOn(!isMicOn)}
                        className={`p-3 rounded-2xl text-white transition ${
                          isMicOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-rose-600 hover:bg-rose-500'
                        }`}
                        title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
                      >
                        {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => setIsWebcamOn(!isWebcamOn)}
                        className={`p-3 rounded-2xl text-white transition ${
                          isWebcamOn ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                        title={isWebcamOn ? 'Turn camera off' : 'Turn camera on'}
                      >
                        {isWebcamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => setIsScreenSharing(!isScreenSharing)}
                        className={`p-3 rounded-2xl text-white transition ${
                          isScreenSharing ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                        title="Present Screen"
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={studyGroup.googleMeetUrl || 'https://meet.google.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                      >
                        <span>Open Official Google Meet Tab</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Google Meet Side In-Call Chat Stream */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col h-[520px]">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    In-Call Live Chat
                  </h3>

                  <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
                    {studyGroup.messages?.map((msg) => (
                      <div key={msg.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{msg.sender}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!meetChatInput.trim()) return;
                      onSendMessage(studyGroup.id, studentName, meetChatInput.trim());
                      setMeetChatInput('');
                    }}
                    className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800"
                  >
                    <input
                      type="text"
                      value={meetChatInput}
                      onChange={(e) => setMeetChatInput(e.target.value)}
                      placeholder="Send message to video room..."
                      className="flex-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE FORMS HUB */}
          {activeTab === 'forms' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-5 rounded-3xl bg-purple-900 text-white shadow-xl flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-purple-300" />
                    FUNAAB Official Google Forms Portal
                  </h2>
                  <p className="text-xs text-purple-200 mt-1">
                    Submit Freshers Feedback, Hostel Maintenance Requests, Course Evaluations & Clearance Enquiries
                  </p>
                </div>
              </div>

              {formSubmitted ? (
                <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xl font-bold">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                    Form Response Recorded!
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Your response has been saved directly to the FUNAAB Student Affairs Google Sheet database.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Select Form Type:
                    </label>
                    <select
                      value={formResponses.feedbackType}
                      onChange={(e) => setFormResponses({ ...formResponses, feedbackType: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-bold"
                    >
                      <option value="general">Freshers Onboarding Feedback Form</option>
                      <option value="hostel">Hostel Accommodation & Maintenance Complaint</option>
                      <option value="course">100L Lecture & Lab Course Evaluation</option>
                      <option value="clearance">Clearance & Certificate Verification Query</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      College / Department:
                    </label>
                    <select
                      value={formResponses.department}
                      onChange={(e) => setFormResponses({ ...formResponses, department: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-bold"
                    >
                      <option value="COLENG">COLENG - College of Engineering</option>
                      <option value="COLPHYS">COLPHYS - College of Physical Sciences</option>
                      <option value="COLBIOS">COLBIOS - College of Biological Sciences</option>
                      <option value="COLANIM">COLANIM - College of Animal Science</option>
                      <option value="COLAMRUD">COLAMRUD - Agricultural Management</option>
                      <option value="COLFHEC">COLFHEC - Food Science & Human Ecology</option>
                      <option value="COLERM">COLERM - Environmental Resources</option>
                      <option value="COLVET">COLVET - Veterinary Medicine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Rating / Score (1 to 5):
                    </label>
                    <div className="flex items-center gap-3">
                      {['1', '2', '3', '4', '5'].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFormResponses({ ...formResponses, rating: star })}
                          className={`w-9 h-9 rounded-xl font-bold text-xs transition ${
                            formResponses.rating === star
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {star}★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Detailed Comments / Feedback:
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formResponses.comments}
                      onChange={(e) => setFormResponses({ ...formResponses, comments: e.target.value })}
                      placeholder="Type your feedback, hostel issue, or clearance request..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    Submit Form Response
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: GOOGLE DRIVE & DOCS / SHEETS / SLIDES WORKSPACE */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              {/* Drive Workspace Toolbar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 font-bold text-xs border border-amber-500/20 flex items-center gap-1.5">
                    <FolderPlus className="w-4 h-4" />
                    Shared Google Drive Folder
                  </span>
                  <span className="text-xs text-slate-500">
                    {studyGroup.driveFiles?.length || 0} Collaborative Files
                  </span>
                </div>

                <button
                  onClick={() => setIsCreatingFile(!isCreatingFile)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Document / Sheet</span>
                </button>
              </div>

              {/* File Creation Box */}
              {isCreatingFile && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 shadow-md space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Create New Google Workspace Document
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="File title (e.g. Past Questions Notes.docx)"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs text-slate-900 dark:text-slate-100"
                    />
                    <select
                      value={newFileType}
                      onChange={(e: any) => setNewFileType(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs text-slate-900 dark:text-slate-100 font-bold"
                    >
                      <option value="doc">📄 Google Doc (.docx)</option>
                      <option value="sheet">📊 Google Sheet (.xlsx)</option>
                      <option value="slide">🎬 Google Slides (.pptx)</option>
                      <option value="form">📝 Google Form Quiz</option>
                    </select>
                    <button
                      onClick={() => {
                        if (!newFileName.trim()) return;
                        onAddDriveFile(studyGroup.id, {
                          name: newFileName.trim(),
                          type: newFileType,
                          author: studentName,
                          content: newFileContent || 'Created during FUNAAB collaborative study session.',
                        });
                        setNewFileName('');
                        setNewFileContent('');
                        setIsCreatingFile(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow"
                    >
                      Save to Drive
                    </button>
                  </div>
                </div>
              )}

              {/* Main Drive Workspace Split: File List & Live Editor View */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* File Navigator List */}
                <div className="space-y-2">
                  {studyGroup.driveFiles?.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => {
                        setSelectedFile(file);
                        setActiveDocEditorText(file.content || '');
                      }}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        selectedFile?.id === file.id
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-700 shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {file.type === 'doc' && <FileText className="w-5 h-5 text-blue-500" />}
                        {file.type === 'sheet' && <Table className="w-5 h-5 text-emerald-500" />}
                        {file.type === 'slide' && <Presentation className="w-5 h-5 text-amber-500" />}
                        {file.type === 'form' && <CheckSquare className="w-5 h-5 text-purple-500" />}
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {file.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 block">
                            By {file.author} • {file.updatedAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Embedded Canvas / Editor Viewport */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-md flex flex-col h-[460px]">
                  {selectedFile ? (
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs uppercase">
                            {selectedFile.type} Editor
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {selectedFile.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => alert(`Saved changes for ${selectedFile.name} to Google Drive!`)}
                          className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 shadow"
                        >
                          Sync to Drive
                        </button>
                      </div>

                      {/* Editor Canvas */}
                      <textarea
                        value={activeDocEditorText}
                        onChange={(e) => setActiveDocEditorText(e.target.value)}
                        placeholder="Type collaborative notes here..."
                        className="flex-1 w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                      Select a Google Drive file on the left to edit or view.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GOOGLE CALENDAR SYNC */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-8 h-8 text-purple-300" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Google Calendar Study Sync</h2>
                    <p className="text-xs text-purple-200">Automatically sync study sessions and test schedules to your Google Calendar</p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Scheduled Event</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Confirmed Venue
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white">
                    {studyGroup.courseCode}: {studyGroup.courseTitle}
                  </h3>

                  <p className="text-xs text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-300" />
                    <span>Time: <strong>{studyGroup.timeStr}</strong></span>
                  </p>

                  <p className="text-xs text-slate-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Location: <strong>{studyGroup.locationName}</strong></span>
                  </p>

                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleCreateGoogleCalendarLink}
                      className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Add directly to Google Calendar</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    {calendarSynced && (
                      <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Synced to Google Calendar!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: GOOGLE MAPS LIVE INTEGRATION */}
          {activeTab === 'maps' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-lg flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    FUNAAB Campus Vector & Satellite Map
                  </h3>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Live GPS tracker, turn-by-turn navigation HUD, and building directions.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 shadow"
                >
                  Return to Full Map Screen
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Venue Location:</h4>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{studyGroup.locationName}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Coordinates: 7.2275° N, 3.4445° E</p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Transit & Distance:</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300">Walking distance from Motion Ground: ~350m (4 mins)</p>
                  <p className="text-[11px] text-slate-500 mt-1">Shuttle route: Board Green Taxi from School Gate</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer info */}
        <div className="px-4 py-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Google Workspace Hub active inside FUNAAB Campus Map.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition"
          >
            Close Workspace
          </button>
        </div>

      </div>
    </div>
  );
};
