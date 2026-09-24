import { CampusEvent } from '../types/campus';

/**
 * Utility to convert an event's dateStr and timeStr to start and end Date objects.
 */
export function getEventStartEndDates(evt: CampusEvent): { start: Date; end: Date } {
  const eventDate = new Date();
  const lowerDate = evt.dateStr.toLowerCase();

  if (lowerDate.includes('today')) {
    // Keep today's date
  } else if (lowerDate.includes('tomorrow')) {
    eventDate.setDate(eventDate.getDate() + 1);
  } else {
    const parsed = new Date(evt.dateStr);
    if (!isNaN(parsed.getTime())) {
      eventDate.setTime(parsed.getTime());
    }
  }

  let startHour = 9;
  let startMinute = 0;
  let endHour = 11;
  let endMinute = 0;

  if (evt.timeStr && evt.timeStr.includes('-')) {
    const parts = evt.timeStr.split('-');
    const startStr = parts[0].trim();
    const endStr = parts[1].trim();

    const parseTimeComponent = (timeStr: string) => {
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (match) {
        let hour = parseInt(match[1], 10);
        const minute = parseInt(match[2], 10);
        const ampm = match[3] ? match[3].toUpperCase() : null;
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        return { hour, minute };
      }
      return null;
    };

    const parsedStart = parseTimeComponent(startStr);
    const parsedEnd = parseTimeComponent(endStr);

    if (parsedStart) {
      startHour = parsedStart.hour;
      startMinute = parsedStart.minute;
    }
    if (parsedEnd) {
      endHour = parsedEnd.hour;
      endMinute = parsedEnd.minute;
    }
  }

  const start = new Date(eventDate);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(eventDate);
  end.setHours(endHour, endMinute, 0, 0);

  if (end <= start) {
    end.setTime(start.getTime() + 60 * 60 * 1000);
  }

  return { start, end };
}

/**
 * Format a Date object to ISO basic string required by iCal and Google Calendar (YYYYMMDDTHHMMSSZ).
 */
export function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
}

/**
 * Generates Google Calendar web URL for an event.
 */
export function getGoogleCalendarUrl(evt: CampusEvent): string {
  const { start, end } = getEventStartEndDates(evt);
  const startIso = formatDateToICS(start);
  const endIso = formatDateToICS(end);

  const title = encodeURIComponent(evt.title);
  const location = encodeURIComponent(`${evt.locationName}, ${evt.venueDetail}, FUNAAB`);
  
  const detailsText = `${evt.description}\n\nCategory: ${evt.category}\nTarget Audience: ${evt.targetAudience || 'All Students'}\nOrganized by: ${evt.organizer}${evt.speakerOrChair ? '\nChair: ' + evt.speakerOrChair : ''}\n\nGenerated via FUNAAB Campus Smart Map`;
  const details = encodeURIComponent(detailsText);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

/**
 * Triggers a download of an .ics (iCalendar) file for Apple Calendar, Outlook, and local device calendars.
 */
export function downloadICalendarFile(evt: CampusEvent): void {
  const { start, end } = getEventStartEndDates(evt);
  const startIso = formatDateToICS(start);
  const endIso = formatDateToICS(end);
  const nowIso = formatDateToICS(new Date());

  const location = `${evt.locationName}, ${evt.venueDetail}, FUNAAB`;
  const description = `${evt.description}\\n\\nOrganized by: ${evt.organizer}${evt.speakerOrChair ? '\\nChair: ' + evt.speakerOrChair : ''}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FUNAAB Campus Smart Map//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:funaab-evt-${evt.id}-${start.getTime()}@funaab.edu.ng`,
    `DTSTAMP:${nowIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${evt.title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location.replace(/\n/g, ' ')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${evt.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
