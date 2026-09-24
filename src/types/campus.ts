export type LocationCategory = 
  | 'academic'
  | 'hostel'
  | 'facility'
  | 'landmark'
  | 'recreation'
  | 'theatre';

export interface CampusLocation {
  id: string;
  name: string;
  fullName: string;
  category: LocationCategory;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  aliases: string[];
  college?: string;
  popular?: boolean;
  color?: string;
  tips?: string;
}

export type TravelMode = 'WALKING' | 'DRIVING';

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  maneuver?: 'straight' | 'turn-left' | 'turn-right' | 'roundabout' | 'arrive';
  coord?: { lat: number; lng: number };
}

export interface CalculatedRoute {
  originName: string;
  destinationName: string;
  originCoords: { lat: number; lng: number };
  destinationCoords: { lat: number; lng: number };
  distanceMeters: number;
  durationSeconds: number;
  path: { lat: number; lng: number }[];
  steps: RouteStep[];
  mode: TravelMode;
}

export interface UserLocationState {
  coords: { lat: number; lng: number } | null;
  rawCoords?: { lat: number; lng: number } | null;
  heading: number | null;
  accuracy: number | null;
  altitude?: number | null;
  speed?: number | null;
  isSimulated: boolean;
  active: boolean;
  error: string | null;
  lockStatus?: 'searching' | 'locked' | 'high-precision' | 'simulated';
  isSnapped?: boolean;
  locationName?: string;
}

export type EventCategory = 
  | 'lecture'
  | 'hall_meeting'
  | 'seminar'
  | 'ceremony'
  | 'sports'
  | 'student_union';

export interface CampusEvent {
  id: string;
  title: string;
  category: EventCategory;
  locationId: string;
  locationName: string;
  venueDetail: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  organizer: string;
  dateStr: string;
  timeStr: string;
  status: 'live' | 'upcoming' | 'concluded';
  targetAudience: string;
  description: string;
  speakerOrChair?: string;
  badgeColor?: string;
}

export interface StudyGroupMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export interface ClassroomAnnouncement {
  id: string;
  author: string;
  date: string;
  text: string;
  commentsCount?: number;
}

export interface ClassroomAssignment {
  id: string;
  title: string;
  dueDate: string;
  points: number;
  instructions: string;
  submitted?: boolean;
}

export interface DriveWorkspaceFile {
  id: string;
  name: string;
  type: 'doc' | 'sheet' | 'slide' | 'form' | 'pdf';
  updatedAt: string;
  author: string;
  content?: string;
  fileUrl?: string;
}

export interface StudyGroup {
  id: string;
  courseCode: string;
  courseTitle: string;
  locationId: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  organizer: string;
  timeStr: string;
  maxMembers: number;
  membersCount: number;
  members: string[];
  topic: string;
  badgeColor?: string;
  department?: string;
  description?: string;
  meetingTime?: string;
  googleMeetUrl?: string;
  googleClassroomCode?: string;
  messages?: StudyGroupMessage[];
  classroomAnnouncements?: ClassroomAnnouncement[];
  classroomAssignments?: ClassroomAssignment[];
  driveFiles?: DriveWorkspaceFile[];
}
