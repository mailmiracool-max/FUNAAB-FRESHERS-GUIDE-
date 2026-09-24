import { CampusEvent, EventCategory } from '../types/campus';

export const INITIAL_CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: 'evt_1',
    title: 'GNS 111: Modern Agriculture & Society',
    category: 'lecture',
    locationId: '1k_cap',
    locationName: '1,000 Capacity Lecture Theatre (1K CAP)',
    venueDetail: 'Main Floor & Gallery Halls A-C',
    coordinates: { lat: 7.22460, lng: 3.44750 },
    organizer: 'Directorate of General Studies (DGS)',
    dateStr: 'Today',
    timeStr: '09:00 AM - 11:00 AM',
    status: 'live',
    targetAudience: '100 Level (All Colleges)',
    description: 'Mandatory general studies lecture on the role of agricultural technology in food security, national development, and rural transformation.',
    speakerOrChair: 'Prof. A. O. Adeleke (Course Coordinator)',
    badgeColor: '#8B5CF6', // Purple
  },
  {
    id: 'evt_2',
    title: 'Mandela Hall General Resident & Security Congress',
    category: 'hall_meeting',
    locationId: 'male_hostel',
    locationName: 'Nelson Mandela Hall of Residence',
    venueDetail: 'Central Quadrangle & Common Room',
    coordinates: { lat: 7.23450, lng: 3.44950 },
    organizer: 'Mandela Hall Executive Committee & Hall Warden',
    dateStr: 'Today',
    timeStr: '07:30 PM - 09:30 PM',
    status: 'upcoming',
    targetAudience: 'Mandela Hall Residents',
    description: 'Discussion on power inverter maintenance, water supply schedules, room inspection procedures, and upcoming Hall Week festivities.',
    speakerOrChair: 'Hall Chairperson & Hall Master',
    badgeColor: '#F59E0B', // Amber
  },
  {
    id: 'evt_3',
    title: 'SUG Parliamentary Sitting & Welfare Hearing',
    category: 'student_union',
    locationId: 'su_building',
    locationName: 'Student Union Building (SUB)',
    venueDetail: 'Senate Chambers, 1st Floor',
    coordinates: { lat: 7.22520, lng: 3.44300 },
    organizer: 'Students’ Union Government (SUG)',
    dateStr: 'Today',
    timeStr: '04:00 PM - 06:30 PM',
    status: 'upcoming',
    targetAudience: 'SRC Parliamentarians & All Students',
    description: 'Official legislative session deliberating on intra-campus shuttle fare stabilization, library nocturnal hours during exams, and student welfare initiatives.',
    speakerOrChair: 'Hon. Senate President & SUG President',
    badgeColor: '#EC4899', // Pink
  },
  {
    id: 'evt_4',
    title: 'COLENG AI & Embedded Robotics Innovation Expo',
    category: 'seminar',
    locationId: 'coleng',
    locationName: 'COLENG Complex (College of Engineering)',
    venueDetail: 'COLENG Auditorium Hall 1',
    coordinates: { lat: 7.22250, lng: 3.45100 },
    organizer: 'Nigerian Universities Engineering Students’ Association (NUESA)',
    dateStr: 'Today',
    timeStr: '11:30 AM - 02:00 PM',
    status: 'live',
    targetAudience: 'Engineering, Computer Science & Tech Enthusiasts',
    description: 'Live demonstration of automated agricultural drone prototypes, precision irrigation microcontrollers, and student-built solar rovers.',
    speakerOrChair: 'Engr. Dr. K. O. Babatunde',
    badgeColor: '#06B6D4', // Cyan
  },
  {
    id: 'evt_5',
    title: '38th Matriculation Ceremony Official Rehearsal',
    category: 'ceremony',
    locationId: 'ceremonial_building',
    locationName: 'FUNAAB Ceremonial Building',
    venueDetail: 'Grand Auditorium & Stage',
    coordinates: { lat: 7.21980, lng: 3.44380 },
    organizer: 'University Ceremonials Committee & Registry',
    dateStr: 'Tomorrow',
    timeStr: '10:00 AM - 01:00 PM',
    status: 'upcoming',
    targetAudience: 'Newly Admitted Freshmen & Deans of Colleges',
    description: 'Mandatory ceremonial procession practice, academic gown distribution guidelines, and matriculation oath recitation protocol.',
    speakerOrChair: 'University Registrar & Academic Affairs',
    badgeColor: '#10B981', // Emerald
  },
  {
    id: 'evt_6',
    title: 'Iyalode Tinubu Hall (ITH) Safety & Health Forum',
    category: 'hall_meeting',
    locationId: 'female_hostel',
    locationName: 'Iyalode Tinubu Hall (ITH Female)',
    venueDetail: 'ITH Cafeteria Pavilion',
    coordinates: { lat: 7.23550, lng: 3.44800 },
    organizer: 'ITH Hall Executive Council',
    dateStr: 'Tomorrow',
    timeStr: '06:00 PM - 08:00 PM',
    status: 'upcoming',
    targetAudience: 'ITH Female Residents',
    description: 'Interactive hygiene sensitization, mental health wellness workshop, and hostel security vigilance meeting.',
    speakerOrChair: 'Hall Warden & University Health Services Nurse',
    badgeColor: '#F59E0B', // Amber
  },
  {
    id: 'evt_7',
    title: 'Inter-Collegiate Dean’s Cup Semi-Final Match',
    category: 'sports',
    locationId: 'sports_complex',
    locationName: 'University Sports Complex',
    venueDetail: 'Main Football Stadium & Track',
    coordinates: { lat: 7.23150, lng: 3.44100 },
    organizer: 'FUNAAB Sports Council & Directorate of Sports',
    dateStr: 'Tomorrow',
    timeStr: '03:30 PM - 05:45 PM',
    status: 'upcoming',
    targetAudience: 'All College Football Fans & Supporters',
    description: 'High-stakes semi-final derby clash: COLENG Tigers vs COLPLANT Warriors. Free admission for all students with valid ID cards.',
    speakerOrChair: 'Director of Sports & FUNAAB Referees Association',
    badgeColor: '#EF4444', // Red
  },
  {
    id: 'evt_8',
    title: 'ICTREC Machine Learning & Cloud Hackathon Briefing',
    category: 'seminar',
    locationId: 'ictrec',
    locationName: 'ICTREC Building (Computer Centre)',
    venueDetail: 'Lab 3 (High Performance Computing Lab)',
    coordinates: { lat: 7.22420, lng: 3.44680 },
    organizer: 'ICT Resource Centre (ICTREC) & Google Developer Group FUNAAB',
    dateStr: 'Today',
    timeStr: '01:00 PM - 03:00 PM',
    status: 'live',
    targetAudience: 'Developers, Data Analysts & CS Students',
    description: 'Hands-on briefing on Google Cloud credits, challenge tracks in agricultural AI, and API deployment for campus web apps.',
    speakerOrChair: 'ICTREC Senior Technical Lead',
    badgeColor: '#06B6D4', // Cyan
  },
  {
    id: 'evt_9',
    title: 'COLVET Clinical Grand Rounds: Ruminant Pathology',
    category: 'lecture',
    locationId: 'colvet',
    locationName: 'COLVET Veterinary Teaching Hospital',
    venueDetail: 'Auditorium 2 & Large Animal Ward',
    coordinates: { lat: 7.22550, lng: 3.45450 },
    organizer: 'College of Veterinary Medicine',
    dateStr: 'Friday',
    timeStr: '08:30 AM - 11:00 AM',
    status: 'upcoming',
    targetAudience: 'DVM 400L - 600L Veterinary Students',
    description: 'Clinical case study review on tick-borne hemoparasites in white Fulani cattle and modern therapeutic protocols.',
    speakerOrChair: 'Prof. E. B. Otesile (Consultant Clinician)',
    badgeColor: '#8B5CF6', // Purple
  },
  {
    id: 'evt_10',
    title: 'Postgraduate Thesis Defense Colloquium',
    category: 'seminar',
    locationId: 'senate',
    locationName: 'Senate Building',
    venueDetail: 'Postgraduate Board Room, 2nd Floor',
    coordinates: { lat: 7.22580, lng: 3.44520 },
    organizer: 'Postgraduate School (PGS)',
    dateStr: 'Friday',
    timeStr: '10:00 AM - 01:30 PM',
    status: 'upcoming',
    targetAudience: 'M.Sc & Ph.D Candidates, Supervisors',
    description: 'Public oral defense of doctoral research dissertations in Soil Science, Biotechnology, and Agricultural Economics.',
    speakerOrChair: 'Dean, Postgraduate School',
    badgeColor: '#06B6D4', // Cyan
  },
  {
    id: 'evt_11',
    title: 'MTH 111: Vectors, Geometry & Dynamics Extra Drill',
    category: 'lecture',
    locationId: '2k_cap',
    locationName: '2,000 Capacity Amphitheatre (2K CAP)',
    venueDetail: 'Amphitheatre Central Arena',
    coordinates: { lat: 7.22720, lng: 3.44350 },
    organizer: 'Department of Mathematics',
    dateStr: 'Saturday',
    timeStr: '08:00 AM - 11:30 AM',
    status: 'upcoming',
    targetAudience: '100L Science, Engineering & Agronomy',
    description: 'Comprehensive problem-solving session covering coordinate geometry, vector products, and past departmental questions.',
    speakerOrChair: 'Dr. S. A. Agboola & Graduate TAs',
    badgeColor: '#8B5CF6', // Purple
  }
];

const LOCAL_STORAGE_KEY = 'funaab_custom_campus_events_v1';

export function getStoredCampusEvents(): CampusEvent[] {
  if (typeof window === 'undefined') return INITIAL_CAMPUS_EVENTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return INITIAL_CAMPUS_EVENTS;
    const customEvents = JSON.parse(raw);
    return [...INITIAL_CAMPUS_EVENTS, ...customEvents];
  } catch (err) {
    console.warn('Failed to load custom events from localStorage', err);
    return INITIAL_CAMPUS_EVENTS;
  }
}

export function saveCustomCampusEvent(event: CampusEvent): CampusEvent[] {
  if (typeof window === 'undefined') return INITIAL_CAMPUS_EVENTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const customEvents: CampusEvent[] = raw ? JSON.parse(raw) : [];
    customEvents.push(event);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customEvents));
    return [...INITIAL_CAMPUS_EVENTS, ...customEvents];
  } catch (err) {
    console.warn('Failed to save custom event to localStorage', err);
    return INITIAL_CAMPUS_EVENTS;
  }
}

export const EVENT_CATEGORY_CONFIG: Record<
  EventCategory,
  { label: string; icon: string; color: string; bgClass: string; textClass: string; borderClass: string }
> = {
  lecture: {
    label: 'Lectures & Classes',
    icon: 'GraduationCap',
    color: '#8B5CF6',
    bgClass: 'bg-purple-500/15',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/40',
  },
  hall_meeting: {
    label: 'Hostel & Hall Meetings',
    icon: 'Home',
    color: '#F59E0B',
    bgClass: 'bg-amber-500/15',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/40',
  },
  seminar: {
    label: 'Seminars & Workshops',
    icon: 'Lightbulb',
    color: '#06B6D4',
    bgClass: 'bg-cyan-500/15',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/40',
  },
  ceremony: {
    label: 'Ceremonies & Official',
    icon: 'Award',
    color: '#10B981',
    bgClass: 'bg-emerald-500/15',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/40',
  },
  sports: {
    label: 'Sports & Tournaments',
    icon: 'Trophy',
    color: '#EF4444',
    bgClass: 'bg-rose-500/15',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/40',
  },
  student_union: {
    label: 'Student Union (SUG)',
    icon: 'Users',
    color: '#EC4899',
    bgClass: 'bg-pink-500/15',
    textClass: 'text-pink-400',
    borderClass: 'border-pink-500/40',
  },
};
