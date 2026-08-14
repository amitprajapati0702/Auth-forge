export interface SessionData {
  userId: string;

  sessionId: string;

  createdAt: string;

  lastActivityAt: string;

  userAgent?: string;

  ipAddress?: string;
}