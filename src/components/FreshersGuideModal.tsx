import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Navigation, 
  HelpCircle, 
  Send, 
  Compass, 
  Info, 
  Bus, 
  Home, 
  GraduationCap,
  Layers,
  Award,
  Camera
} from 'lucide-react';
import { 
  FUNAAB_SLANG_DICTIONARY, 
  INITIAL_FRESHERS_CHECKLIST, 
  FUNAAB_TRANSPORT_FARES,
  FreshersChecklistItem 
} from '../data/freshersGuide';
import { CampusLocation } from '../types/campus';
import { NoticeGallerySection } from './NoticeGallerySection';

interface FreshersGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (loc: CampusLocation) => void;
  onNavigateToLocation?: (loc: CampusLocation) => void;
  locations?: CampusLocation[];
  onOpenCGPACalculator?: () => void;
}

export const FreshersGuideModal: React.FC<FreshersGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  onNavigateToLocation,
  locations = [],
  onOpenCGPACalculator,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'assistant' | 'map_guide' | 'checklist' | 'slang' | 'transport' | 'gallery'>('assistant');

  // Gemini Freshers Assistant Query State
  const [query, setQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Welcome to FUNAAB! 🌿 I am your Gemini Freshers Advisor.\n\nAsk me anything about:\n• Clearance procedure & SUB location\n• How to get to 1K CAP, JAO 3-in-1, or COLENG\n• Hostel registration (UK, IYAT, NEEDS, Marble)\n• Green taxi fares and campus shortcuts\n• 100L CGPA targets (A=5, B=4, C=3, D=2, E=1, F=0)`
    }
  ]);

  // Checklist State
  const [checklist, setChecklist] = useState<FreshersChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('funaab_freshers_checklist');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_FRESHERS_CHECKLIST;
  });

  const toggleChecklistItem = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    try {
      localStorage.setItem('funaab_freshers_checklist', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAskAssistant = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isAsking) return;

    const userMsg = query.trim();
    setQuery('');
    setChatHistory((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsAsking(true);

    try {
      const res = await fetch('/api/gemini/freshers-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg }),
      });
      const data = await res.json();
      if (data.answer) {
        setChatHistory((prev) => [...prev, { role: 'assistant', text: data.answer }]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'I am here to guide you! You can view the Live GPS Map on the main screen to navigate directly to any lecture hall or building in FUNAAB.',
          },
        ]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'FUNAAB Freshers Tip: Use the Live Map tab to search for 1K CAP, 250 Seater, Motion Ground, or SUB and get step-by-step turn guidance!',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const completedCount = checklist.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-modal-backdrop">
      <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-modal-content">
        
        {/* Header Banner */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  FUNAAB Freshers Survival Guide
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black bg-amber-400 text-slate-950 rounded-full uppercase">
                  Class of 2026
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                AI Assistant • Campus Layout • Clearance Checklist • Slang Dictionary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'assistant'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Gemini Freshers AI Advisor</span>
          </button>

          <button
            onClick={() => setActiveTab('map_guide')}
            className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'map_guide'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Map Layout & Reference</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Freshers Checklist ({completedCount}/{checklist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('slang')}
            className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'slang'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            <span>FUNAAB Slang & Dictionary</span>
          </button>

          <button
            onClick={() => setActiveTab('transport')}
            className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'transport'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Bus className="w-4 h-4 text-teal-600" />
            <span>Transport & Fares</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-3 font-bold text-xs flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-500" />
            <span>My Notice Gallery</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
          
          {/* TAB 0: MY CAMPUS NOTICE BOARD GALLERY */}
          {activeTab === 'gallery' && <NoticeGallerySection />}
          
          {/* TAB 1: GEMINI FRESHERS AI ADVISOR */}
          {activeTab === 'assistant' && (
            <div className="h-full flex flex-col gap-4">
              {/* Chat Stream Box */}
              <div className="flex-1 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 overflow-y-auto space-y-3 min-h-[320px] shadow-sm">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-md">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl text-xs max-w-[85%] whitespace-pre-line leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAsking && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl w-fit">
                    <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                    Consulting FUNAAB Campus Knowledge Base...
                  </div>
                )}
              </div>

              {/* Preset Quick Questions */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
                  Quick Ask:
                </span>
                {[
                  'Where is 1K CAP hall?',
                  'How do I complete clearance at SUB?',
                  'What green taxi goes to COLENG?',
                  'Which hostels are on campus?'
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(q);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition flex-shrink-0 shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleAskAssistant} className="flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Gemini anything about FUNAAB campus, clearance, lectures, or hostels..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || isAsking}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <span>Ask AI</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MAP LAYOUT & REFERENCE VISUALS */}
          {activeTab === 'map_guide' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-md">
                <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  FUNAAB Campus Master Blueprint Reference
                </h3>
                <p className="text-xs text-emerald-100 mt-1">
                  FUNAAB covers 10,000 hectares with a dual loop road system. The core junction revolves around Motion Ground, Senate Building, and 'Nimbe Adedipe Central Library.
                </p>
              </div>

              {/* Reference Grid Cards for Main Campus Wings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase">
                    Entrance & Admin Wing
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-2">
                    Main Gate ➔ Ceremonial Building ➔ Motion Ground
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Past the Main Gate lies the Ceremonial Building, Central Mosque, Chapel of Grace, and Health Center. Continuing straight brings you to the Motion Ground, Senate Building, and 'Nimbe Library.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-xs font-bold uppercase">
                    West Lecture Halls & Colleges
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-2">
                    1K CAP ➔ 250 Seater ➔ Mahmud ➔ COLPHYS / COLFHEC
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    The western academic wing hosts 1,000 Capacity Amphitheatre (1K CAP), 250 Seater, ALL LAB, Mahmud Hall, 500 Seater, and College of Physical Sciences (COLPHYS).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase">
                    Northern Engineering & Hostels
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-2">
                    COLENG ➔ COLAMRUD ➔ AUD 3 ➔ UK & IYAT Hostels
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Heading north past 'Nimbe Library leads to College of Engineering (COLENG), COLAMRUD, Bankole Auditorium (AUD 3), Umar Kabir Male Hostel, and Iyaloja Adunni Female Hostel.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-bold uppercase">
                    Student Union & Commercial Center
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-2">
                    SUB ➔ SUG Building ➔ Central Commercial Shops
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    The Student Union Building (SUB) handles Dean of Student Affairs clearance, student sports/recreation, food eateries, and student government secretariat.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FRESHERS CLEARANCE CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Freshers Onboarding Progress</span>
                  <span className="text-emerald-600 font-mono">{progressPercent}% Completed</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                      item.completed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                    }`}
                  >
                    <button className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs sm:text-sm font-bold ${
                            item.completed
                              ? 'line-through text-slate-500 dark:text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.locationName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FUNAAB SLANG & DICTIONARY */}
          {activeTab === 'slang' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Learn FUNAAB campus terminology, location aliases, and student slang used across hostels, lecture halls, and SUG rallies!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FUNAAB_SLANG_DICTIONARY.map((slang, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                        {slang.term}
                      </h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {slang.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                      {slang.definition}
                    </p>
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      "{slang.example}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TRANSPORT & FARES GUIDE */}
          {activeTab === 'transport' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Bus className="w-5 h-5 text-emerald-600" />
                  Official Campus Intra-Transit & Fares (2026)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Green Taxis and Shuttle Buses are regulated by FUNAAB Parks & Transport Committee.
                </p>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {FUNAAB_TRANSPORT_FARES.map((tf, i) => (
                    <div key={i} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {tf.route}
                        </span>
                        <span className="text-[11px] text-slate-400">Vehicle: {tf.vehicle}</span>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black font-mono">
                        {tf.fare}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>FUNAAB Freshers Guide powered by Gemini AI</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCGPACalculator && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCGPACalculator();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition"
              >
                CGPA Advisor
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition shadow"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
