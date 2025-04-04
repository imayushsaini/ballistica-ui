import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { HostManagerService } from './host-manager.service';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  leaderboard: any[] = [];
  leaderboardUpdateEvent = new Subject();
  constructor(
    private http: HttpClient,
    private hostManager: HostManagerService
  ) {}

  getTop200(): Observable<any> {
    return this.http.get(`${this.hostManager.getProxyUrl()}/api/top-200`);
  }

  getCompleteLeaderboard(): Observable<any> {
    return this.http.get(
      `${this.hostManager.getProxyUrl()}/api/current-leaderboard`
    );
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
    if (this.leaderboard.length != 0) return;
    this.getTop200().subscribe((dat) => {
      this.leaderboard = Object.keys(dat).map((key) => {
        return {
          rank: dat[key]['rank'],
          id: key,
          name: dat[key]['name'],
          scores: dat[key]['scores'],
          games: dat[key]['games'],
          kills: dat[key]['kills'],
          deaths: dat[key]['deaths'],
          last_seen: dat[key]['last_seen'],
        };
      });
      this.leaderboard.sort(this.compare);
      this.leaderboardUpdateEvent.next();

      this.getCompleteLeaderboard().subscribe((data) => {
        this.leaderboard = Object.keys(data).map((key) => {
          return {
            rank: dat[key]['rank'],
            id: key,
            name: dat[key]['name'],
            scores: dat[key]['scores'],
            games: dat[key]['games'],
            kills: dat[key]['kills'],
            deaths: dat[key]['deaths'],
            last_seen: dat[key]['last_seen'],
          };
        });
      });
      this.leaderboard.sort(this.compare);
      this.leaderboardUpdateEvent.next();
    });
  }
}
