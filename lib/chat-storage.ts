/**
 * Local Storage Utilities for Chat History
 * Stores chat data only on customer's device
 */

export interface StoredChatSession {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'maestravibe_chat_history';
const SESSION_KEY = 'maestravibe_current_session';

/**
 * Get or create a device-specific session ID
 * Uses browser fingerprinting data (no personal data)
 */
function getDeviceSessionId(): string {
  let sessionId = localStorage.getItem('maestravibe_device_id');
  
  if (!sessionId) {
    // Generate unique ID based on device characteristics
    const navigator_ = typeof navigator !== 'undefined' ? navigator : null;
    const screen_ = typeof screen !== 'undefined' ? screen : null;
    
    const deviceFingerprint = [
      navigator_?.language || 'unknown',
      screen_?.width || 'unknown',
      screen_?.height || 'unknown',
      new Date().getTimezoneOffset(),
      Math.random().toString(36).substring(2, 15),
    ].join('|');

    sessionId = btoa(deviceFingerprint + Date.now()).slice(0, 24);
    localStorage.setItem('maestravibe_device_id', sessionId);
  }

  return sessionId;
}

/**
 * Save chat message to local storage
 */
export function saveChatMessage(
  message: string,
  role: 'user' | 'assistant'
): void {
  try {
    const sessions = getAllChatSessions();
    const currentSessionId = localStorage.getItem(SESSION_KEY) || 'default';

    let session = sessions.find((s) => s.id === currentSessionId);

    if (!session) {
      session = {
        id: currentSessionId,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      sessions.push(session);
    }

    session.messages.push({
      role,
      content: message,
      timestamp: Date.now(),
    });

    session.updatedAt = Date.now();

    // Keep only last 10000 characters per session to avoid storage issues
    const totalSize = session.messages.reduce(
      (sum, m) => sum + m.content.length,
      0
    );
    if (totalSize > 10000) {
      session.messages = session.messages.slice(-Math.floor(session.messages.length / 2));
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('Local storage quota exceeded, clearing old sessions');
      clearOldChatSessions();
    } else {
      console.error('Error saving chat message:', error);
    }
  }
}

/**
 * Get all chat sessions for this device
 */
export function getAllChatSessions(): StoredChatSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get current chat session
 */
export function getCurrentChatSession(): StoredChatSession | null {
  try {
    const sessions = getAllChatSessions();
    const sessionId = localStorage.getItem(SESSION_KEY) || 'default';
    return sessions.find((s) => s.id === sessionId) || null;
  } catch {
    return null;
  }
}

/**
 * Start a new chat session
 */
export function startNewChatSession(): string {
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  localStorage.setItem(SESSION_KEY, newSessionId);
  return newSessionId;
}

/**
 * Delete a chat session
 */
export function deleteChatSession(sessionId: string): void {
  try {
    const sessions = getAllChatSessions().filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));

    if (localStorage.getItem(SESSION_KEY) === sessionId) {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (error) {
    console.error('Error deleting chat session:', error);
  }
}

/**
 * Clear old chat sessions (keep only last 5)
 */
export function clearOldChatSessions(): void {
  try {
    const sessions = getAllChatSessions()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error clearing old sessions:', error);
  }
}

/**
 * Get storage size used (for debugging)
 */
export function getStorageInfo(): {
  used: number;
  sessionCount: number;
  totalMessages: number;
} {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const sessions = getAllChatSessions();
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);

    return {
      used: data ? new Blob([data]).size : 0,
      sessionCount: sessions.length,
      totalMessages,
    };
  } catch {
    return { used: 0, sessionCount: 0, totalMessages: 0 };
  }
}

/**
 * Export chat history as JSON
 */
export function exportChatHistory(): string {
  const sessions = getAllChatSessions();
  return JSON.stringify(sessions, null, 2);
}

/**
 * Clear all chat history
 */
export function clearAllChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
}
