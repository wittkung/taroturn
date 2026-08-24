// src/services/journalStorageService.ts - Local & Cloud Reading Journal Storage

import { ReadingSession } from '../types/tarot';

const JOURNAL_STORAGE_KEY = 'taroturn_reading_journal';

export class JournalStorageService {
  public static getSavedSessions(): ReadingSession[] {
    try {
      const data = localStorage.getItem(JOURNAL_STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as ReadingSession[];
    } catch (err) {
      console.error('Failed to load journal sessions from localStorage:', err);
      return [];
    }
  }

  public static saveSession(session: ReadingSession): void {
    try {
      const existing = this.getSavedSessions();
      // Deduplicate by session_id
      const filtered = existing.filter((s) => s.session_id !== session.session_id);
      const updated = [session, ...filtered];
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
    } catch (err) {
      console.error('Failed to save journal session:', err);
    }
  }

  public static updateSessionAiInterpretation(sessionId: string, interpretation: string): void {
    try {
      const existing = this.getSavedSessions();
      const updated = existing.map((s) =>
        s.session_id === sessionId ? { ...s, ai_interpretation: interpretation } : s
      );
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to update session AI interpretation:', err);
    }
  }

  public static deleteSession(sessionId: string): void {
    try {
      const existing = this.getSavedSessions();
      const updated = existing.filter((s) => s.session_id !== sessionId);
      localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete journal session:', err);
    }
  }

  public static clearAll(): void {
    localStorage.removeItem(JOURNAL_STORAGE_KEY);
  }
}
