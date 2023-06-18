interface RosterItem {
  client_id: number;
  device_id: string;
  name: string;
}

export interface Roster {
  [key: string]: RosterItem;
}

interface Playlist {
  current: string;
  next: string;
}

export interface TeamPlayer {
  account_id: string;
  character: string;
  device_id: string;
  inGame: boolean;
  name: string;
}

interface Team {
  color: number[];
  name: string;
  players: TeamPlayer[];
  score: number;
}

export interface TeamInfo {
  [key: string]: Team;
}

interface System {
  cpu: string;
  ram: string;
}

export interface LiveData {
  chats: string[];
  name: string;
  playlist: Playlist;
  roster: Roster;
  system: System;
  teamInfo: TeamInfo;
  sessionType: string;
}
