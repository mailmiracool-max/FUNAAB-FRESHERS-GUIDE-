import { StudyGroup } from '../types/campus';

export const INITIAL_STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'sg_1',
    courseCode: 'MTH 211',
    courseTitle: 'Agricultural Mathematics II Revision',
    locationId: 'nimbe_library',
    locationName: "'Nimbe Library (Main Reading Hall)",
    coordinates: { lat: 7.22810, lng: 3.44490 },
    organizer: 'Oluwaseun M. (COLPHYS)',
    timeStr: 'Today, 04:00 PM - 06:00 PM',
    maxMembers: 12,
    membersCount: 7,
    members: ['Oluwaseun M.', 'Amina K.', 'Tunde B.', 'Chidera E.', 'Kehinde A.', 'Femi L.', 'Zainab O.'],
    topic: 'Vector calculus, matrices, and differential equations past questions breakdown.',
    badgeColor: '#10B981', // Emerald
    googleMeetUrl: 'https://meet.google.com/abc-funaab-mth',
    googleClassroomCode: 'mth211-funaab-2026',
    messages: [
      { id: 'm1', sender: 'Oluwaseun M.', text: 'Welcome everyone! Please review chapter 4 before we meet at Nimbe Library.', timestamp: '12:30 PM' },
      { id: 'm2', sender: 'Amina K.', text: 'Got it! I brought past questions from 2024 as well.', timestamp: '12:45 PM' }
    ],
    classroomAnnouncements: [
      { id: 'ca1', author: 'Oluwaseun M.', date: 'Today, 01:10 PM', text: 'Welcome to MTH 211 Revision Group! We will be covering Matrix transformations and Vector Fields today at Nimbe Library.', commentsCount: 3 },
      { id: 'ca2', author: 'Dr. Ojo (Department Co-ordinator)', date: 'Yesterday', text: 'Mid-semester CA Test holds next Tuesday by 8:00 AM at 1,000 Capacity LT. Download revision formulas sheet below.', commentsCount: 12 }
    ],
    classroomAssignments: [
      { id: 'as1', title: 'Problem Set 3: Eigenvalues & Vector Calculus', dueDate: 'Tomorrow, 11:59 PM', points: 20, instructions: 'Solve questions 1-8 from the shared Google Drive worksheet. Submit steps clearly.', submitted: false },
      { id: 'as2', title: 'Past Question 2023 Solutions Review', dueDate: 'Friday, 04:00 PM', points: 15, instructions: 'Work through Section B questions on partial differential equations.', submitted: true }
    ],
    driveFiles: [
      { id: 'df1', name: 'MTH 211 Lecture Summary & Formula Sheet.docx', type: 'doc', updatedAt: 'Today, 10:00 AM', author: 'Oluwaseun M.', content: 'CHAPTER 1: MATRIX CALCULUS\nDeterminants, Inverse Matrices, and Cramer\'s Rule...\n\nCHAPTER 2: DIFFERENTIAL EQUATIONS\nFirst-order linear ODEs: dy/dx + P(x)y = Q(x)' },
      { id: 'df2', name: 'Past Questions Grade Tracker & Study Schedule.xlsx', type: 'sheet', updatedAt: 'Yesterday', author: 'Amina K.', content: 'Course Unit: 3 Units | Target CA Score: 28/30\nWeek 1: Matrices (Completed)\nWeek 2: Vectors (In Progress)' },
      { id: 'df3', name: 'Vector Calculus Visual Presentation.pptx', type: 'slide', updatedAt: '3 days ago', author: 'Tunde B.', content: 'Slide 1: Gradient, Divergence, and Curl in 3D Space\nSlide 2: Green\'s Theorem Applications in Agricultural Physics' },
      { id: 'df4', name: 'MTH 211 Mock Assessment Quiz', type: 'form', updatedAt: 'Just now', author: 'FUNAAB Study Hub', content: '1. Evaluate det(A) for 3x3 matrix...\n2. Solve dy/dx = x^2 + 1...' }
    ]
  },
  {
    id: 'sg_2',
    courseCode: 'COL 202',
    courseTitle: 'Introduction to Computer Programming (Python/JS)',
    locationId: 'ictrec',
    locationName: 'ICTREC Computer Centre Lab 2',
    coordinates: { lat: 7.22420, lng: 3.44680 },
    organizer: 'Miracle A. (COLENG)',
    timeStr: 'Today, 02:00 PM - 04:30 PM',
    maxMembers: 15,
    membersCount: 11,
    members: ['Miracle A.', 'David O.', 'Esther P.', 'Samuel I.', 'Blessing N.', 'John D.', 'Gift O.', 'Emmanuel T.', 'Ruth W.', 'Victor H.', 'Faith S.'],
    topic: 'Object-oriented programming concepts, algorithms, and collaborative coding practice.',
    badgeColor: '#06B6D4', // Cyan
    googleMeetUrl: 'https://meet.google.com/col-202-code',
    googleClassroomCode: 'col202-ict-hub',
    messages: [
      { id: 'm3', sender: 'Miracle A.', text: 'Lab 2 AC is working. Bring your laptops and extension boxes!', timestamp: '11:15 AM' }
    ],
    classroomAnnouncements: [
      { id: 'ca3', author: 'Miracle A.', date: 'Today, 10:00 AM', text: 'Remember to install VS Code and Python 3.12 before joining today\'s coding session at ICTREC.', commentsCount: 5 }
    ],
    classroomAssignments: [
      { id: 'as3', title: 'Lab Practical 2: Student Grading System Script', dueDate: 'Today, 06:00 PM', points: 30, instructions: 'Write a program that takes student scores and calculates CGPA according to FUNAAB 4.0 scale.', submitted: false }
    ],
    driveFiles: [
      { id: 'df5', name: 'COL 202 Python Quickstart Guide.docx', type: 'doc', updatedAt: 'Today', author: 'Miracle A.', content: 'Functions, Data Structures, Lists, Dictionaries, and File I/O in Python.' },
      { id: 'df6', name: 'FUNAAB Student Database Practice.xlsx', type: 'sheet', updatedAt: 'Yesterday', author: 'David O.', content: 'Sample dataset containing 500 FUNAAB student records for data analysis exercises.' }
    ]
  },
  {
    id: 'sg_3',
    courseCode: 'AGR 201',
    courseTitle: 'General Agriculture & Crop Production',
    locationId: 'colends',
    locationName: 'COLENDS Lecture Theatre 1',
    coordinates: { lat: 7.22150, lng: 3.45300 },
    organizer: 'Prof. Adebayo Study Circle',
    timeStr: 'Tomorrow, 10:00 AM - 12:00 PM',
    maxMembers: 20,
    membersCount: 14,
    members: ['Adebayo S.', 'Modupe A.', 'Ibrahim K.', 'Chioma N.', 'Yusuf M.', 'Grace E.', 'Peter O.', 'Tosin D.', 'Temitope R.', 'Bolaji F.', 'Kikelomo A.', 'Sadiq M.', 'Funke L.', 'Kunle J.'],
    topic: 'Agronomy principles, soil fertility management, and farm mechanization notes review.',
    badgeColor: '#F59E0B', // Amber
    googleMeetUrl: 'https://meet.google.com/agr-201-funaab',
    googleClassroomCode: 'agr201-crop-sci',
    messages: [
      { id: 'm4', sender: 'Adebayo S.', text: 'We will be discussing soil profiles and fertilizer application rates.', timestamp: 'Yesterday' }
    ],
    classroomAnnouncements: [
      { id: 'ca4', author: 'Adebayo S.', date: 'Yesterday', text: 'Field practical test notes have been uploaded to our Google Drive folder.', commentsCount: 2 }
    ],
    classroomAssignments: [
      { id: 'as4', title: 'Soil Fertility & NPK Calculations Worksheet', dueDate: 'Friday, 12:00 PM', points: 25, instructions: 'Calculate NPK fertilizer requirements for 5 hectares of cassava plantation.', submitted: false }
    ],
    driveFiles: [
      { id: 'df7', name: 'Crop Production & Soil Profile Notes.docx', type: 'doc', updatedAt: '2 days ago', author: 'Adebayo S.', content: 'Soil horizons, NPK ratio calculations, pest management strategies.' }
    ]
  },
  {
    id: 'sg_4',
    courseCode: 'CHM 201',
    courseTitle: 'Organic Chemistry Reaction Mechanisms',
    locationId: 'colbios',
    locationName: 'COLBIOS Amphitheatre',
    coordinates: { lat: 7.22650, lng: 3.44200 },
    organizer: 'Dr. Aliyu Mentorship Hub',
    timeStr: 'Tomorrow, 02:00 PM - 05:00 PM',
    maxMembers: 15,
    membersCount: 9,
    members: ['Aliyu B.', 'Mariam S.', 'Daniel C.', 'Victoria O.', 'Emmanuel K.', 'Precious A.', 'Solomon T.', 'Deborah N.', 'Samuel E.'],
    topic: 'Aliphatic and aromatic hydrocarbon synthesis, stereochemistry, and functional group reactions.',
    badgeColor: '#8B5CF6', // Purple
    googleMeetUrl: 'https://meet.google.com/chm-201-org',
    googleClassroomCode: 'chm201-bios-hub',
    messages: [
      { id: 'm5', sender: 'Aliyu B.', text: 'Focus on SN1 vs SN2 reaction mechanisms for tomorrow.', timestamp: '09:00 AM' }
    ],
    classroomAnnouncements: [
      { id: 'ca5', author: 'Aliyu B.', date: 'Today, 08:30 AM', text: 'Be sure to check out the reaction mechanism slide deck before class.', commentsCount: 4 }
    ],
    classroomAssignments: [
      { id: 'as5', title: 'Electrophilic Substitution Mechanism Practice', dueDate: 'Next Monday', points: 20, instructions: 'Draw full curly arrow mechanisms for benzene nitration and halogenation.', submitted: false }
    ],
    driveFiles: [
      { id: 'df8', name: 'Organic Reaction Mechanisms Slide Deck.pptx', type: 'slide', updatedAt: 'Yesterday', author: 'Aliyu B.', content: 'Slide 1: Nucleophilic Substitution (SN1 vs SN2)\nSlide 2: Elimination Reactions (E1 vs E2)' }
    ]
  },
];

export function getStoredStudyGroups(): StudyGroup[] {
  try {
    const saved = localStorage.getItem('funaab_study_groups');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return INITIAL_STUDY_GROUPS;
}

export function saveStudyGroup(group: StudyGroup) {
  try {
    const current = getStoredStudyGroups();
    const updated = [group, ...current];
    localStorage.setItem('funaab_study_groups', JSON.stringify(updated));
    return updated;
  } catch (e) {}
  return INITIAL_STUDY_GROUPS;
}

export function updateStudyGroupMembership(groupId: string, studentName: string, join: boolean) {
  try {
    const current = getStoredStudyGroups();
    const updated = current.map((g) => {
      if (g.id === groupId) {
        let newMembers = [...g.members];
        if (join && !newMembers.includes(studentName)) {
          newMembers.push(studentName);
        } else if (!join) {
          newMembers = newMembers.filter((m) => m !== studentName);
        }
        return {
          ...g,
          members: newMembers,
          membersCount: newMembers.length,
        };
      }
      return g;
    });
    localStorage.setItem('funaab_study_groups', JSON.stringify(updated));
    return updated;
  } catch (e) {}
  return getStoredStudyGroups();
}

export function sendStudyGroupMessage(groupId: string, sender: string, text: string) {
  try {
    const current = getStoredStudyGroups();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = current.map((g) => {
      if (g.id === groupId) {
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          sender,
          text,
          timestamp: nowTime,
        };
        const currentMessages = g.messages || [];
        return {
          ...g,
          messages: [...currentMessages, newMessage],
        };
      }
      return g;
    });
    localStorage.setItem('funaab_study_groups', JSON.stringify(updated));
    return updated;
  } catch (e) {}
  return getStoredStudyGroups();
}

export function addClassroomAnnouncement(groupId: string, author: string, text: string) {
  try {
    const current = getStoredStudyGroups();
    const updated = current.map((g) => {
      if (g.id === groupId) {
        const newAnn = {
          id: `ca_${Date.now()}`,
          author,
          date: 'Just now',
          text,
          commentsCount: 0,
        };
        return {
          ...g,
          classroomAnnouncements: [newAnn, ...(g.classroomAnnouncements || [])],
        };
      }
      return g;
    });
    localStorage.setItem('funaab_study_groups', JSON.stringify(updated));
    return updated;
  } catch (e) {}
  return getStoredStudyGroups();
}

export function addDriveWorkspaceFile(groupId: string, file: { name: string; type: 'doc' | 'sheet' | 'slide' | 'form' | 'pdf'; author: string; content?: string }) {
  try {
    const current = getStoredStudyGroups();
    const updated = current.map((g) => {
      if (g.id === groupId) {
        const newFile = {
          id: `df_${Date.now()}`,
          name: file.name,
          type: file.type,
          updatedAt: 'Just now',
          author: file.author,
          content: file.content || '',
        };
        return {
          ...g,
          driveFiles: [newFile, ...(g.driveFiles || [])],
        };
      }
      return g;
    });
    localStorage.setItem('funaab_study_groups', JSON.stringify(updated));
    return updated;
  } catch (e) {}
  return getStoredStudyGroups();
}

export function toggleAssignmentSubmission(groupId: string, assignmentId: string) {
  try {
    const current = getStoredStudyGroups();
    const updated = current.map((g) => {
      if (g.id === groupId) {
        const updatedAssignments = (g.classroomAssignments || []).map(a => {
          if (a.id === assignmentId) {
            return { ...a, submitted: !a.submitted };
          }
          return a;
        });
        return {
          ...g,
          classroomAssignments: updatedAssignments,
        };
      }
      return g;
    });
    localStorage.setItem('funaab_study_groups', JSON.stringify(updated));
    return updated;
  } catch (e) {}
  return getStoredStudyGroups();
}
