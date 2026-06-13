export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
}

/**
 * Fetch the list of the 8 most recent emails from Gmail.
 */
export async function fetchRecentEmails(accessToken: string): Promise<GmailMessage[]> {
  try {
    const listUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8';
    const response = await fetch(listUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Gmail API failure list: ${response.status} ${errorMsg}`);
    }

    const listData = await response.json();
    if (!listData.messages || listData.messages.length === 0) {
      return [];
    }

    // Parallel fetch details for each message
    const detailedPromises = listData.messages.map(async (msg: { id: string; threadId: string }) => {
      try {
        const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
        const detailRes = await fetch(detailUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (!detailRes.ok) return null;
        const detailData = await detailRes.json();
        
        const headers = detailData.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown';
        const to = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || 'Unknown';
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

        return {
          id: msg.id,
          threadId: msg.threadId,
          subject,
          from,
          to,
          date,
          snippet: detailData.snippet || ''
        } as GmailMessage;
      } catch (err) {
        console.error(`Failed to fetch details for email ID ${msg.id}:`, err);
        return null;
      }
    });

    const results = await Promise.all(detailedPromises);
    return results.filter((msg): msg is GmailMessage => msg !== null);
  } catch (err) {
    console.error('fetchRecentEmails failed:', err);
    throw err;
  }
}

/**
 * Helper to encode unicode strings into Base64URL
 */
function toBase64Url(str: string): string {
  // Use TextEncoder to correctly handle multi-byte characters (utf-8)
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send an email using standard Gmail REST API
 */
export async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  bodyText: string
): Promise<{ id: string; threadId: string }> {
  try {
    // Construct valid MIME (RFC 2822) message format
    const rfc822Message = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      bodyText
    ].join('\r\n');

    const base64Raw = toBase64Url(rfc822Message);

    const sendUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64Raw
      })
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Gmail Send API failure: ${response.status} ${errorMsg}`);
    }

    return await response.json();
  } catch (err) {
    console.error('sendEmail failed:', err);
    throw err;
  }
}
