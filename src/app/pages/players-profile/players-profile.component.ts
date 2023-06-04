import { Component } from "@angular/core";

interface Profile {
  display_string: string[];
  profiles: [];
  name: string;
  isBan: boolean;
  isMuted: boolean;
  accountAge: string;
  registerOn: number;
  canStartKickVote: boolean;
  spamCount: number;
  lastSpam: number;
  totaltimeplayer: number;
  lastseen: number;
  warnCount: number;
  lastWarned: number;
  verified: boolean;
  rejoincount: number;
  lastJoin: number;
  cMsgCount: number;
  lastMsgTime: number;
  lastMsg: string;
  cSameMsg: number;
  lastIP: string;
  deviceUUID: string;
}
interface Profiles {
  [key: string]: Profile;
}
@Component({
  selector: "app-players-profile",
  templateUrl: "./players-profile.component.html",
  styleUrls: ["./players-profile.component.scss"],
})
export class PlayersProfileComponent {
  PROFILES: Profiles = {
    "pb-123": {
      display_string: ["\ue063HeySmoothy"],
      profiles: [],
      name: "\ue063HeySmoothy",
      isBan: false,
      isMuted: false,
      accountAge: "2022-05-29 21:53:44",
      registerOn: 1655022106.4740922,
      canStartKickVote: true,
      spamCount: 0,
      lastSpam: 1655022106.4740927,
      totaltimeplayer: 0,
      lastseen: 0,
      warnCount: 0,
      lastWarned: 1655552812.9632144,
      verified: true,
      rejoincount: 1,
      lastJoin: 1655552812.963215,
      cMsgCount: 0,
      lastMsgTime: 1655406931.728448,
      lastMsg: "ok",
      cSameMsg: 0,
      lastIP: "axj~}j~~n`ai",
      deviceUUID: "eedccec9b0c17d3716b936981bb753c3872d905c",
    },
  };
  DBS = ["profiles.json @ Latest", "profiles.json2023-12-10"];

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  onBanClick() {
    console.log("ban");
  }
  onUnmuteClick() {
    console.log("mute");
  }
  onKickClick() {
    console.log("kick");
  }
}
