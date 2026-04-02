/**
 * AIM-style chat: types only. No mock data.
 * Buddies, rooms, and messages come from APIs / WebSocket.
 */

export type AimStatus = "online" | "away" | "busy" | "offline";

export interface AimProfile {
  screenName: string;
  status: AimStatus;
  awayMessage: string;
}

export interface AimBuddy {
  id: string;
  screenName: string;
  status: AimStatus;
}

export interface AimRoom {
  id: string;
  name: string;
}

export interface AimMessage {
  id: string;
  author: string;
  content: string;
  at: number;
  roomId?: string;
  buddyId?: string;
}
