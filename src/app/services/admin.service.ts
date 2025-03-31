import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HostManagerService } from './host-manager.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private hostManager: HostManagerService
  ) {}
  login(passKey: string): Observable<any> {
    const headers = new HttpHeaders().set('Secret-Key', passKey);
    return this.http.post(
      `${this.hostManager.getProxyUrl()}/api/login`,
      {},
      { headers }
    );
  }
  getSettings() {
    return this.http.get(
      `${this.hostManager.getProxyUrl()}/api/server-settings`
    );
  }
  updateSettings(settings: any) {
    return this.http.post(
      `${this.hostManager.getProxyUrl()}/api/server-settings`,
      settings
    );
  }
  getDBs(type: string) {
    const params = new HttpParams().set('type', type);
    return this.http.get(`${this.hostManager.getProxyUrl()}/api/db-list`, {
      params,
    });
  }
  searchPlayer(key: string, db: string) {
    const params = new HttpParams().set('key', key).set('db', db);
    return this.http.get(
      `${this.hostManager.getProxyUrl()}/api/search-player`,
      { params }
    );
  }
  getAccountInfo(acocunt_id: string) {
    const params = new HttpParams().set('account-id', acocunt_id);
    return this.http.get(
      `${this.hostManager.getProxyUrl()}/api/get-player-info`,
      { params }
    );
  }
  updatePlayer(action: string, account_id: string, duration: number) {
    const params = new HttpParams()
      .set('account-id', account_id)
      .set('action', action)
      .set('duration', duration);
    return this.http.post(
      `${this.hostManager.getProxyUrl()}/api/update-player`,
      {},
      { params }
    );
  }
  getRoles() {
    return this.http.get(`${this.hostManager.getProxyUrl()}/api/roles`);
  }
  // TODO import modelof roles here
  saveRoles(roles: any) {
    return this.http.post(`${this.hostManager.getProxyUrl()}/api/roles`, roles);
  }
  getPerks() {
    return this.http.get(`${this.hostManager.getProxyUrl()}/api/perks`);
  }
  updatePerks(perks: any) {
    return this.http.post(`${this.hostManager.getProxyUrl()}/api/perks`, perks);
  }
  getConfig() {
    return this.http.get(`${this.hostManager.getProxyUrl()}/api/config`);
  }
  updateConfig(config: any) {
    return this.http.post(
      `${this.hostManager.getProxyUrl()}/api/config`,
      config
    );
  }
  searchLogs(key: string, db: string) {
    const params = new HttpParams().set('key', key).set('db', db);

    return this.http.get(`${this.hostManager.getProxyUrl()}/api/search-logs`, {
      params,
    });
  }
  performAction(action: string, value: string) {
    const params = new HttpParams().set('value', value).set('action', action);

    return this.http.post(
      `${this.hostManager.getProxyUrl()}/api/action`,
      {},
      { params }
    );
  }
}
