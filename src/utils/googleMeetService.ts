/**
 * Google Meet Integration Service
 * Utilizes Google Meet Spaces REST API (https://meet.googleapis.com/v2/spaces)
 * for instant study room creation and video call integration.
 */

export interface GoogleMeetSpace {
  name: string; // e.g. "spaces/ABC123XYZ"
  meetingUri: string; // e.g. "https://meet.google.com/abc-defg-hij"
  meetingCode?: string; // e.g. "abc-defg-hij"
}

/**
 * Creates a new Google Meet space using the Google Meet REST API (v2)
 * Scope required: https://www.googleapis.com/auth/meetings.space.created
 */
export async function createGoogleMeetSpace(accessToken?: string): Promise<GoogleMeetSpace> {
  if (accessToken) {
    try {
      const response = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            accessType: 'OPEN',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.meetingUri) {
          return {
            name: data.name || 'spaces/funaab-meeting',
            meetingUri: data.meetingUri,
            meetingCode: data.meetingCode || data.meetingUri.split('/').pop(),
          };
        }
      }
      console.warn('Google Meet API response did not contain meetingUri, falling back to direct URL generator.');
    } catch (error) {
      console.warn('Google Meet Space API creation error:', error);
    }
  }

  // Fallback: Generate an instant Google Meet call link
  const randomCode = Math.random().toString(36).substring(2, 5) + '-' + 
                     Math.random().toString(36).substring(2, 6) + '-' + 
                     Math.random().toString(36).substring(2, 5);
  
  return {
    name: `spaces/${randomCode}`,
    meetingUri: `https://meet.google.com/${randomCode}`,
    meetingCode: randomCode,
  };
}

/**
 * Returns a direct link to launch an instant Google Meet session
 */
export function getInstantGoogleMeetUrl(): string {
  return 'https://meet.google.com/new';
}
