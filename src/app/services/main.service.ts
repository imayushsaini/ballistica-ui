import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

const API = environment.API_ENDPOINT;

interface ServerInfo {
  serverName: string;
  discord: string;
  vapidKey: string;
}
@Injectable({
  providedIn: "root",
})
export class MainService {
  serverInfo: ServerInfo = {
    serverName: "",
    discord: "",
    vapidKey: "",
  };
  constructor(private http: HttpClient) {
    this.getServerInfo().subscribe((data: ServerInfo) => {
      this.serverInfo = data;
    });
  }

  getServerInfo(): Observable<any> {
    return this.http.get(`${API}/api/server-info`);
  }
  getLiveStats(): Observable<any> {
    return this.http.get(`${API}/api/live-stats`);
  }
  getDiscord(): string {
    return this.serverInfo["discord"];
  }
  getVapidKey(): string {
    return this.serverInfo["vapidKey"];
  }
  getServerName(): string {
    return this.serverInfo["serverName"];
  }
}
