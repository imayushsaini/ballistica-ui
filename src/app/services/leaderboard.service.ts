import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { environment } from "src/environments/environment";

const API = environment.API_ENDPOINT;

@Injectable({
  providedIn: "root",
})
export class LeaderboardService {
  leaderboard: any[] = [];
  leaderboardUpdateEvent = new Subject();
  constructor(private http: HttpClient) {}

  getTop200(): Observable<any> {
    return this.http.get(`${API}/api/top-200`);
  }

  getCompleteLeaderboard(): Observable<any> {
    return this.http.get(`${API}/api/current-leaderboard`);
  }

  getLeaderboard() {
    return this.leaderboard;
  }

  compare(a: any, b: any) {
    if (a.rank < b.rank) {
      return -1;
    }
    if (a.rank > b.rank) {
      return 1;
    }
    return 0;
  }

  loadLeaderboard() {
    this.getTop200().subscribe((dat) => {
      this.leaderboard = Object.keys(dat).map((key) => {
        return {
          rank: dat[key]["rank"],
          id: key,
          name: dat[key]["name"],
          scores: dat[key]["scores"],
          games: dat[key]["games"],
          kills: dat[key]["kills"],
          deaths: dat[key]["deaths"],
          last_seen: dat[key]["last_seen"],
        };
      });
      this.leaderboard.sort(this.compare);
      this.leaderboardUpdateEvent.next();
      console.log("got leaderboard");
      this.getCompleteLeaderboard().subscribe((data) => {
        this.leaderboard = Object.keys(data).map((key) => {
          return {
            rank: dat[key]["rank"],
            id: key,
            name: dat[key]["name"],
            scores: dat[key]["scores"],
            games: dat[key]["games"],
            kills: dat[key]["kills"],
            deaths: dat[key]["deaths"],
            last_seen: dat[key]["last_seen"],
          };
        });
      });
      this.leaderboard.sort(this.compare);
      this.leaderboardUpdateEvent.next();
    });
  }
}
