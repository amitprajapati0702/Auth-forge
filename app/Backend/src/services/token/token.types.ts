export interface AccessTokenPayload {
  userId: string;

  email: string;

  role: string;

  sessionId: string;
}


export interface RefereshTokenPayload {
    userId: string;
    sessionId: string;
}
