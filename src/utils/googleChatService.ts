/**
 * Google Chat API Service
 * Interacts with Google Chat REST API (https://chat.googleapis.com/v1)
 * Scopes: https://www.googleapis.com/auth/chat.spaces, https://www.googleapis.com/auth/chat.messages
 */

export interface GoogleChatSpace {
  name: string; // e.g. "spaces/AAAA..."
  displayName: string;
  spaceType?: string;
  externalUserAllowed?: boolean;
}

export interface GoogleChatMessage {
  name?: string;
  text: string;
  createTime?: string;
  sender?: {
    displayName?: string;
  };
}

/**
 * Creates a new Google Chat Space for study groups or course discussions
 */
export async function createGoogleChatSpace(displayName: string, accessToken?: string): Promise<GoogleChatSpace> {
  if (accessToken) {
    try {
      const response = await fetch('https://chat.googleapis.com/v1/spaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceType: 'SPACE',
          displayName: displayName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          name: data.name,
          displayName: data.displayName || displayName,
          spaceType: data.spaceType || 'SPACE',
        };
      }
      console.warn('Google Chat Space API returned non-200:', response.status);
    } catch (error) {
      console.warn('Google Chat Space creation error:', error);
    }
  }

  // Fallback room representation
  const spaceId = 'space_' + Math.random().toString(36).substring(2, 9);
  return {
    name: `spaces/${spaceId}`,
    displayName: displayName,
    spaceType: 'SPACE',
  };
}

/**
 * Sends a message to a Google Chat Space
 */
export async function sendGoogleChatMessage(spaceName: string, text: string, accessToken?: string): Promise<GoogleChatMessage | null> {
  if (accessToken && spaceName.startsWith('spaces/')) {
    try {
      const response = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Google Chat message send error:', error);
    }
  }

  return {
    text,
    createTime: new Date().toISOString(),
  };
}

/**
 * Opens official Google Chat web app URL
 */
export function getGoogleChatUrl(): string {
  return 'https://chat.google.com';
}
