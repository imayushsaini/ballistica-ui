import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { HostManagerService } from './host-manager.service';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  serverName = '';
  discord = '';
  vapidKey = '';
  gotServerInfo = new Subject<void>();
  constructor(
    private http: HttpClient,
    private hostManager: HostManagerService
  ) {
    this.fetchStats();
  }

  fetchStats() {
    this.getLiveStats().subscribe((data) => {
      this.serverName = data.name;
      this.discord = data.discord;
      this.vapidKey = data.vapidKey;
      this.gotServerInfo.next();
      this.hostManager.saveHostName(
        this.hostManager.getSelectedHost(),
        this.serverName
      );
    });
  }
  getLiveStats(): Observable<any> {
    return this.http.get(`${this.hostManager.getProxyUrl()}/api/live-stats`);
  }
  getDiscord(): string {
    return this.discord;
  }
  getVapidKey(): string {
    return this.vapidKey;
  }
  getServerName(): string {
    if (this.serverName === '') this.fetchStats();
    return this.serverName;
  }
  pingproxy(): Observable<any> {
    return this.http.get(`${this.hostManager.getProxyUrl()}/proxy-ping`);
  }
}
