import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

const API = environment.API_ENDPOINT;

@Injectable({
  providedIn: "root",
})
export class MainService {
  serverName = "";
  discord = "";
  vapidKey = "";
  constructor(private http: HttpClient) {
    this.fetchStats();
  }

  fetchStats() {
    this.getLiveStats().subscribe((data) => {
      this.serverName = data.name;
      this.discord = data.discord;
      this.vapidKey = data.vapidKey;
    });
  }
  getLiveStats(): Observable<any> {
    return this.http.get(`${API}/api/live-stats`);
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
    return API.replace("http://", "");
  }
}
