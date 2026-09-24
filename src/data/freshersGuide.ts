export interface FreshersChecklistItem {
  id: string;
  title: string;
  category: 'clearance' | 'academic' | 'hostel' | 'campus_life';
  description: string;
  locationName: string;
  completed: boolean;
}

export interface FUNAABSlangItem {
  term: string;
  definition: string;
  example: string;
  category: 'slang' | 'location' | 'academic';
}

export const FUNAAB_SLANG_DICTIONARY: FUNAABSlangItem[] = [
  {
    term: 'FUNAABite',
    definition: 'A proud bona-fide student or alumnus of Federal University of Agriculture, Abeokuta.',
    example: 'Great FUNAABites! Great!',
    category: 'slang',
  },
  {
    term: 'Motion Ground',
    definition: 'The expansive central green quadrangle connecting Senate Building, Nimbe Library, and Ceremonial Building. The social nucleus of campus.',
    example: 'Let’s meet at Motion Ground after GNS lecture.',
    category: 'location',
  },
  {
    term: '1K CAP',
    definition: '1,000 Capacity Amphitheatre - FUNAAB’s biggest lecture theatre where major 100L GNS classes and university events take place.',
    example: 'GNS 101 holds at 1K CAP by 8:00 AM sharp.',
    category: 'location',
  },
  {
    term: 'Green Taxi',
    definition: 'Official university branded taxis operating internal campus transit between Gate, SUB, Hostels, and Colleges.',
    example: 'Enter green taxi from Gate straight to COLENG.',
    category: 'slang',
  },
  {
    term: 'Keke',
    definition: 'Three-wheeler commercial tricycles that convey students smoothly around campus roads.',
    example: 'Board a keke from Park to ICTREC for your CBT test.',
    category: 'slang',
  },
  {
    term: 'SUB / Arcade',
    definition: 'Student Union Building complex housing DSA offices, relaxation lounges, cafeterias, and student shops.',
    example: 'We are hanging out at SUB after practicals.',
    category: 'location',
  },
  {
    term: 'JAO 3-in-1',
    definition: 'Prof. Julius A. Okojie Lecture Theatre complex consisting of three linked mega lecture halls.',
    example: 'Check the timetable, PHY 101 test is at JAO Hall 2.',
    category: 'location',
  },
  {
    term: 'ALL LAB / Central Lab',
    definition: 'Massive central science practical laboratory block for chemistry, biology, physics, and agriculture practicals.',
    example: 'Don’t forget your lab coat for CHM 101 practical at ALL LAB!',
    category: 'location',
  },
  {
    term: 'Screening & Clearance',
    definition: 'Mandatory verification process where freshers submit admission letters, WAEC/NECO results, and receipts at SUB / Senate.',
    example: 'I just completed my departmental clearance at COLAMRUD.',
    category: 'academic',
  },
  {
    term: 'Junction',
    definition: 'Major intersection points like Motion Ground Junction, COLENG Junction, or Health Center Junction.',
    example: 'Drop me at Motion Ground Junction.',
    category: 'location',
  },
];

export const INITIAL_FRESHERS_CHECKLIST: FreshersChecklistItem[] = [
  {
    id: 'chk_1',
    title: 'Pay Acceptance Fee on FUNAAB Portal',
    category: 'clearance',
    description: 'Log into portal.funaab.edu.ng, generate Remita retrieval reference (RRR), and pay official acceptance fee.',
    locationName: 'Online / Unity Building Banks',
    completed: true,
  },
  {
    id: 'chk_2',
    title: 'Physical Clearance at SUB Complex',
    category: 'clearance',
    description: 'Submit original O’Level result, JAMB admission letter, birth certificate, and passport photos at Student Affairs.',
    locationName: 'SUB (Student Union Building)',
    completed: false,
  },
  {
    id: 'chk_3',
    title: 'Medical Screening & Test at Health Center',
    category: 'clearance',
    description: 'Complete mandatory chest X-ray, blood group, genotype test, and medical fitness certification.',
    locationName: 'Health Center',
    completed: false,
  },
  {
    id: 'chk_4',
    title: 'Register 100L Courses on Portal',
    category: 'academic',
    description: 'Register mandatory courses: MTH 101, CHM 101, PHY 101, BIO 101, GNS 101, GNS 102, and AGE 102.',
    locationName: 'ICTREC / Online Portal',
    completed: false,
  },
  {
    id: 'chk_5',
    title: 'Get Lab Coat & Practical Safety Goggles',
    category: 'academic',
    description: 'Purchase white science laboratory coat for practical sessions at ALL LAB and Central Science Lab.',
    locationName: 'FUNAAB Book Shop / Commercial Shops',
    completed: false,
  },
  {
    id: 'chk_6',
    title: 'Locate Your Allocated Hostel Room',
    category: 'hostel',
    description: 'Check hostel allocation (UK, IYAT, Old Needs, New Needs, Marble) and verify room keys with Hall Warden.',
    locationName: 'Student Hostels Precinct',
    completed: false,
  },
  {
    id: 'chk_7',
    title: 'Join College & Departmental Study Groups',
    category: 'campus_life',
    description: 'Connect with fellow freshers in COLENG, COLPHYS, COLANIM, COLFHEC, COLAMRUD study groups.',
    locationName: 'Nimbe Adedipe Library / Study Rooms',
    completed: false,
  },
  {
    id: 'chk_8',
    title: 'Attend Freshers Orientation & Matriculation',
    category: 'campus_life',
    description: 'Take official matriculation oath and receive academic gown for commemorative photos at Motion Ground.',
    locationName: 'Ceremonial Building & Motion Ground',
    completed: false,
  },
];

export const FUNAAB_TRANSPORT_FARES = [
  { route: 'Main Gate ➔ Motion Ground / Senate', fare: '₦100 - ₦150', vehicle: 'Green Taxi / Shuttle Bus' },
  { route: 'Main Gate ➔ COLENG / COLPHYS / Hostels', fare: '₦150 - ₦200', vehicle: 'Green Taxi / Keke' },
  { route: 'Motion Ground ➔ 1K CAP / 250 Seater', fare: '₦100', vehicle: 'Keke / Walking (5 mins)' },
  { route: 'SUB ➔ Health Center / Sport Center', fare: '₦100', vehicle: 'Keke / Shuttle' },
  { route: 'Main Gate ➔ Camp Bus Stop (Abeokuta Town)', fare: '₦200 - ₦250', vehicle: 'Town Buses / Cabs' },
];
