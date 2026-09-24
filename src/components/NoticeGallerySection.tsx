import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Eye, 
  X, 
  Plus, 
  MapPin, 
  Calendar, 
  Tag, 
  Download, 
  Search, 
  Sparkles,
  Check,
  FileText,
  Image as ImageIcon,
  ZoomIn
} from 'lucide-react';

export interface NoticePhotoItem {
  id: string;
  title: string;
  locationName: string;
  category: 'Timetable' | 'Exam' | 'Clearance' | 'Dept Notice' | 'General';
  imageDataUrl: string;
  timestamp: string;
  notes?: string;
}

const DEFAULT_SAMPLE_NOTICES: NoticePhotoItem[] = [
  {
    id: 'notice-sample-1',
    title: '100L CA & Exam Timetable - SUB Notice Board',
    locationName: 'Student Union Building (SUB)',
    category: 'Timetable',
    imageDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23064e3b"/><rect x="20" y="20" width="560" height="360" rx="16" fill="%23ffffff"/><text x="40" y="60" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23064e3b">FEDERAL UNIVERSITY OF AGRICULTURE, ABEOKUTA</text><text x="40" y="90" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23d97706">100L CONTINUOUS ASSESSMENT TIMETABLE</text><line x1="40" y1="105" x2="560" y2="105" stroke="%23cbd5e1" stroke-width="2"/><text x="40" y="140" font-family="sans-serif" font-size="14" fill="%231e293b">MTH 101: Monday 8:00 AM - 10:00 AM (1K CAP & JAO)</text><text x="40" y="170" font-family="sans-serif" font-size="14" fill="%231e293b">CHM 101: Tuesday 10:00 AM - 12:00 PM (250 Seater)</text><text x="40" y="200" font-family="sans-serif" font-size="14" fill="%231e293b">PHY 101: Wednesday 2:00 PM - 4:00 PM (COLENG Hall)</text><text x="40" y="230" font-family="sans-serif" font-size="14" fill="%231e293b">BIO 101: Thursday 8:00 AM - 10:00 AM (COLPLANT Auditorium)</text><text x="40" y="270" font-family="sans-serif" font-size="12" font-style="italic" fill="%2364748b">Notice: All students must arrive 30 minutes before exam time with ID cards.</text><rect x="40" y="300" width="180" height="40" rx="8" fill="%23d97706"/><text x="55" y="325" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23ffffff">OFFICIAL BULLETIN</text></svg>',
    timestamp: '2026-09-22 09:30 AM',
    notes: 'Verify desk numbers at SUB notice board before exam morning.'
  },
  {
    id: 'notice-sample-2',
    title: 'Freshers Health Centre Clearance Verification',
    locationName: 'FUNAAB Health Centre',
    category: 'Clearance',
    imageDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230f766e"/><rect x="20" y="20" width="560" height="360" rx="16" fill="%23ffffff"/><text x="40" y="60" font-family="sans-serif" font-size="20" font-weight="bold" fill="%230f766e">FUNAAB HEALTH CENTRE</text><text x="40" y="90" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230284c7">MEDICAL CLEARANCE REQUIREMENT 2026</text><line x1="40" y1="105" x2="560" y2="105" stroke="%23cbd5e1" stroke-width="2"/><text x="40" y="140" font-family="sans-serif" font-size="14" fill="%231e293b">1. Blood Group & Genotype Test Certificate</text><text x="40" y="170" font-family="sans-serif" font-size="14" fill="%231e293b">2. Chest X-Ray Film & Report from FUNAAB Clinic</text><text x="40" y="200" font-family="sans-serif" font-size="14" fill="%231e293b">3. 2 Passport Photographs on White Background</text><text x="40" y="240" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23059669">Daily Processing Hours: 8:00 AM - 3:30 PM (Mon - Fri)</text></svg>',
    timestamp: '2026-09-20 11:15 AM',
    notes: 'Come with original receipt of payment for medical screening.'
  }
];

export const NoticeGallerySection: React.FC = () => {
  const [notices, setNotices] = useState<NoticePhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem('funaab_notice_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_SAMPLE_NOTICES;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLightboxNotice, setActiveLightboxNotice] = useState<NoticePhotoItem | null>(null);

  // New Notice Capture Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingImageDataUrl, setPendingImageDataUrl] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('SUB Notice Board');
  const [newCategory, setNewCategory] = useState<'Timetable' | 'Exam' | 'Clearance' | 'Dept Notice' | 'General'>('Timetable');
  const [newNotes, setNewNotes] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('funaab_notice_photos', JSON.stringify(notices));
    } catch (e) {
      console.error('Storage quota reached', e);
    }
  }, [notices]);

  // Process & compress captured/selected image
  const handleProcessImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPendingImageDataUrl(compressedDataUrl);
          setIsAddModalOpen(true);
        }
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessImageFile(e.target.files[0]);
    }
    // reset input
    e.target.value = '';
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingImageDataUrl) return;

    const newNotice: NoticePhotoItem = {
      id: `notice-${Date.now()}`,
      title: newTitle.trim() || 'Campus Notice',
      locationName: newLocation.trim() || 'FUNAAB Campus',
      category: newCategory,
      imageDataUrl: pendingImageDataUrl,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }),
      notes: newNotes.trim()
    };

    setNotices([newNotice, ...notices]);
    setIsAddModalOpen(false);
    setPendingImageDataUrl(null);
    setNewTitle('');
    setNewNotes('');
  };

  const handleDeleteNotice = (id: string) => {
    if (confirm('Delete this notice photo from your gallery?')) {
      setNotices(notices.filter(n => n.id !== id));
      if (activeLightboxNotice?.id === id) {
        setActiveLightboxNotice(null);
      }
    }
  };

  const filteredNotices = notices.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Timetable':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'Exam':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      case 'Clearance':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300';
      case 'Dept Notice':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
    }
  };

  return (
    <div className="space-y-5 animate-tab-content">
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={cameraInputRef} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        onChange={handleFileInputChange} 
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileInputChange} 
      />

      {/* Top Banner Action Section */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 shadow-xl border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
              Freshers Notice Capture
            </span>
            <span className="text-xs text-emerald-200">({notices.length} Photos Stored)</span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            My Campus Notice Board Gallery
          </h3>
          <p className="text-xs text-emerald-200 mt-0.5 max-w-xl leading-relaxed">
            Snap photos of exam timetables, clearance notices, lecture changes, and SUB bulletins directly at any board in FUNAAB.
          </p>
        </div>

        {/* Capture Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>Snap Notice</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition border border-emerald-500/30"
          >
            <Upload className="w-4 h-4 text-amber-300" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notice title, location..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {['All', 'Timetable', 'Exam', 'Clearance', 'Dept Notice', 'General'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notice Gallery Grid */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            No notices found
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Snap Notice" above to take a photo of any bulletin board at SUB, 1K CAP, or Health Centre.
          </p>
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow inline-flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>Take Photo Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
            >
              {/* Photo Thumbnail */}
              <div 
                className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer"
                onClick={() => setActiveLightboxNotice(notice)}
              >
                <img 
                  src={notice.imageDataUrl} 
                  alt={notice.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <span className="p-2 rounded-full bg-slate-900/80 text-white text-xs font-bold flex items-center gap-1">
                    <ZoomIn className="w-4 h-4 text-amber-400" />
                    View Fullscreen
                  </span>
                </div>
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getCategoryBadge(notice.category)}`}>
                  {notice.category}
                </span>
              </div>

              {/* Notice Details */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {notice.title}
                  </h4>

                  <div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="truncate">{notice.locationName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{notice.timestamp}</span>
                    </div>
                  </div>

                  {notice.notes && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      "{notice.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setActiveLightboxNotice(notice)}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Image</span>
                  </button>

                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete notice photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: New Notice Details Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-modal-backdrop">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-content">
            <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Save Campus Notice Photo</h3>
              </div>
              <button 
                onClick={() => { setIsAddModalOpen(false); setPendingImageDataUrl(null); }}
                className="p-1 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="p-4 sm:p-5 space-y-4">
              {/* Image Preview */}
              {pendingImageDataUrl && (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <img src={pendingImageDataUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. MTH 101 Mid-Semester Timetable"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notice Location
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. SUB Notice Board, 1K CAP"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Timetable">Timetable</option>
                    <option value="Exam">Exam</option>
                    <option value="Clearance">Clearance</option>
                    <option value="Dept Notice">Dept Notice</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Exam starts at 8:00 AM sharp. Bring student ID."
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setPendingImageDataUrl(null); }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow"
                >
                  Save to My Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Lightbox View Modal */}
      {activeLightboxNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-modal-backdrop">
          <div className="bg-white dark:bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-modal-content">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-white">{activeLightboxNotice.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>📍 {activeLightboxNotice.locationName}</span>
                  <span>•</span>
                  <span>📅 {activeLightboxNotice.timestamp}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveLightboxNotice(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 flex flex-col items-center justify-center">
              <img 
                src={activeLightboxNotice.imageDataUrl} 
                alt={activeLightboxNotice.title}
                className="max-h-[65vh] w-auto object-contain rounded-2xl shadow-2xl border border-slate-800"
              />
            </div>

            <div className="p-4 bg-slate-900 text-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <div className="text-xs">
                {activeLightboxNotice.notes ? (
                  <p className="italic text-amber-300">"{activeLightboxNotice.notes}"</p>
                ) : (
                  <p className="text-slate-400">Captured at {activeLightboxNotice.locationName}</p>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={activeLightboxNotice.imageDataUrl}
                  download={`${activeLightboxNotice.title.replace(/\s+/g, '_')}.jpg`}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Photo</span>
                </a>

                <button
                  onClick={() => handleDeleteNotice(activeLightboxNotice.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-950 text-rose-300 hover:bg-rose-900 text-xs font-bold flex items-center gap-1.5 transition border border-rose-800/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
