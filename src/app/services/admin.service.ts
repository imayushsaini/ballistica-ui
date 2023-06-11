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
  updatePlayer(action: string, account_id: string) {
    const params = new HttpParams()
      .set("account-id", account_id)
      .set("action", action);
    return this.http.post(`${API}/api/update-player`, {}, { params });
  }
}
