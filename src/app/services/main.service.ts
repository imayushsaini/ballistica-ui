import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Subject } from "rxjs";
import { TokenStorageService } from "./token-storage.service";

@Injectable({
  providedIn: "root",
})
export class MainService {
  serverName = "";
  discord = "";
  vapidKey = "";
  api: string;
  gotServerInfo = new Subject<void>();
  constructor(
    private http: HttpClient,
    private tokenService: TokenStorageService
  ) {
    this.api = tokenService.getSelectedApi();
    

    this.fetchStats();
  }

  fetchStats() {
    this.getLiveStats().subscribe((data) => {
      this.serverName = data.name;
      this.discord = data.discord;
      this.vapidKey = data.vapidKey;
      this.gotServerInfo.next();
      this.tokenService.updateServerName(this.api, this.serverName);
    });
  }
  getLiveStats(): Observable<any> {
    return this.http.get(`${this.api}/api/live-stats`);
  }
  getDiscord(): string {
    return this.discord;
  }
  getVapidKey(): string {
    return this.vapidKey;
  }
  getServerName(): string {
    if (this.serverName === "") this.fetchStats();
    return this.serverName;
  }
  getIP(): string {
    return this.api.replace("http://", "");
  }
}
