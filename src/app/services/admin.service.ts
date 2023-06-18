import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

const API = environment.API_ENDPOINT;

@Injectable({
  providedIn: "root",
})
export class AdminService {
  constructor(private http: HttpClient) {}
  login(passKey: string): Observable<any> {
    const headers = new HttpHeaders().set("Secret-Key", passKey);
    return this.http.post(`${API}/api/login`, {}, { headers });
  }
  getSettings() {
    return this.http.get(`${API}/api/server-settings`);
  }
  updateSettings(settings: any) {
    return this.http.post(`${API}/api/server-settings`, settings);
  }
  getDBs(type: string) {
    const params = new HttpParams().set("type", type);
    return this.http.get(`${API}/api/db-list`, { params });
  }
  searchPlayer(key: string, db: string) {
    const params = new HttpParams().set("key", key).set("db", db);
    return this.http.get(`${API}/api/search-player`, { params });
  }
  getAccountInfo(acocunt_id: string) {
    const params = new HttpParams().set("account-id", acocunt_id);
    return this.http.get(`${API}/api/get-player-info`, { params });
  }
  updatePlayer(action: string, account_id: string, duration: number) {
    const params = new HttpParams()
      .set("account-id", account_id)
      .set("action", action)
      .set("duration", duration);
    return this.http.post(`${API}/api/update-player`, {}, { params });
  }
  getRoles() {
    return this.http.get(`${API}/api/roles`);
  }
  // TODO import modelof roles here
  saveRoles(roles: any) {
    return this.http.post(`${API}/api/roles`, roles);
  }
  getPerks() {
    return this.http.get(`${API}/api/perks`);
  }
  updatePerks(perks: any) {
    return this.http.post(`${API}/api/perks`, perks);
  }
  getConfig() {
    return this.http.get(`${API}/api/config`);
  }
  updateConfig(config: any) {
    return this.http.post(`${API}/api/config`, config);
  }
  searchLogs(key: string, db: string) {
    const params = new HttpParams().set("key", key).set("db", db);

    return this.http.get(`${API}/api/search-logs`, { params });
  }
  performAction(action: string, value: string) {
    const params = new HttpParams().set("value", value).set("action", action);

    return this.http.post(`${API}/api/action`, {}, { params });
  }
}
