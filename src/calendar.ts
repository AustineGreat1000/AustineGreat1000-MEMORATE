export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start: {
    dateTime?: string;
    date?: string; // For all-day events
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string; // For all-day events
    timeZone?: string;
  };
  attendees?: {
    email: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }[];
}

export interface CreateEventInput {
  summary: string;
  description?: string;
  location?: string;
  startTime: string; // ISO string 2026-05-24T14:00:00
  endTime: string;   // ISO string 2026-05-24T15:00:00
  timeZone?: string;
  attendees?: string[]; // Array of email strings
}

/**
 * Fetch upcoming calendar events from the user's Primary calendar.
 */
export async function fetchUpcomingEvents(accessToken: string, maxResults = 15): Promise<CalendarEvent[]> {
  try {
    const nowIso = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(nowIso)}&maxResults=${maxResults}&orderBy=startTime&singleEvents=true`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Google Calendar API list failure: ${response.status} ${errorMsg}`);
    }

    const data = await response.json();
    return (data.items || []) as CalendarEvent[];
  } catch (err) {
    console.error('fetchUpcomingEvents failed:', err);
    throw err;
  }
}

/**
 * Create a new calendar event.
 */
export async function createCalendarEvent(
  accessToken: string,
  input: CreateEventInput
): Promise<CalendarEvent> {
  try {
    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all';
    
    const bodyPayload = {
      summary: input.summary,
      description: input.description,
      location: input.location,
      start: {
        dateTime: input.startTime,
        timeZone: input.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      },
      end: {
        dateTime: input.endTime,
        timeZone: input.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      },
      attendees: input.attendees?.map(email => ({ email })) || []
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Google Calendar Create failure: ${response.status} ${errorMsg}`);
    }

    return await response.json();
  } catch (err) {
    console.error('createCalendarEvent failed:', err);
    throw err;
  }
}

/**
 * Delete a calendar event from primary.
 */
export async function deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?sendUpdates=all`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Google Calendar Delete failure: ${response.status} ${errorMsg}`);
    }
  } catch (err) {
    console.error('deleteCalendarEvent failed:', err);
    throw err;
  }
}
