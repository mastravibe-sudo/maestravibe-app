// lib/chat-storage.ts

export interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface StoredChatSession {
  id: string;
  messages: StoredMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'maestravibe_chat_history';
const SESSION_KEY = 'maestravibe_current_session';
const DEVICE_KEY  = 'maestravibe_device_id';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return 'default';
  }
}

function getAllSessions(): StoredChatSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: StoredChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      clearOldChatSessions();
    }
  }
}

function getCurrentSessionId(): string {
  try {
    return localStorage.getItem(SESSION_KEY) || 'default';
  } catch {
    return 'default';
  }
}

export function saveChatMessage(
  content: string,
  role: 'user' | 'assistant'
): void {
  try {
    const sessions      = getAllSessions();
    const sessionId     = getCurrentSessionId();
    let session         = sessions.find(s => s.id === sessionId);

    if (!session) {
      session = {
        id:        sessionId,
        messages:  [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      sessions.push(session);
    }

    session.messages.push({ role, content, timestamp: Date.now() });
    session.updatedAt = Date.now();

    // Trim if session gets too large (keep last 50 messages)
    if (session.messages.length > 50) {
      session.messages = session.messages.slice(-50);
    }

    saveSessions(sessions);
  } catch {
    // Silently fail — chat storage is non-critical
  }
}

export function getCurrentChatSession(): StoredChatSession | null {
  try {
    const sessions  = getAllSessions();
    const sessionId = getCurrentSessionId();
    return sessions.find(s => s.id === sessionId) ?? null;
  } catch {
    return null;
  }
}

export function startNewChatSession(): string {
  try {
    const newId = `session_${Date.now()}_${generateId()}`;
    localStorage.setItem(SESSION_KEY, newId);
    return newId;
  } catch {
    return 'default';
  }
}

export function clearAllChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Silently fail
  }
}

export function clearOldChatSessions(): void {
  try {
    const sessions = getAllSessions()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 3); // keep only latest 3 sessions
    saveSessions(sessions);
  } catch {
    // Silently fail
  }
}

export function deleteChatSession(sessionId: string): void {
  try {
    const sessions = getAllSessions().filter(s => s.id !== sessionId);
    saveSessions(sessions);
    if (getCurrentSessionId() === sessionId) {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Silently fail
  }
}

export function exportChatHistory(): string {
  try {
    return JSON.stringify(getAllSessions(), null, 2);
  } catch {
    return '[]';
  }
}

export function saveUserPreferences(prefs: {
  preferredCategories?: string[];
  priceRange?: { min: number; max: number };
  lastSearchTerms?: string[];
}): void {
  try {
    localStorage.setItem('mv_user_prefs', JSON.stringify(prefs));
  } catch {
    // Silently fail
  }
}

export function getUserPreferences(): {
  preferredCategories?: string[];
  priceRange?: { min: number; max: number };
  lastSearchTerms?: string[];
} {
  try {
    const raw = localStorage.getItem('mv_user_prefs');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getStorageInfo(): {
  used: number;
  sessionCount: number;
  totalMessages: number;
} {
  try {
    const sessions      = getAllSessions();
    const data          = localStorage.getItem(STORAGE_KEY) ?? '';
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
    return {
      used:         new Blob([data]).size,
      sessionCount: sessions.length,
      totalMessages,
    };
  } catch {
    return { used: 0, sessionCount: 0, totalMessages: 0 };
  }
}