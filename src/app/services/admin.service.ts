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
      `${this.hostManager.getHostUrl()}/api/login`,
      {},
      { headers }
    );
  }
  getSettings() {
    return this.http.get(
      `${this.hostManager.getHostUrl()}/api/server-settings`
    );
  }
  updateSettings(settings: any) {
    return this.http.post(
      `${this.hostManager.getHostUrl()}/api/server-settings`,
      settings
    );
  }
  getDBs(type: string) {
    const params = new HttpParams().set('type', type);
    return this.http.get(`${this.hostManager.getHostUrl()}/api/db-list`, {
      params,
    });
  }
  searchPlayer(key: string, db: string) {
    const params = new HttpParams().set('key', key).set('db', db);
    return this.http.get(
      `${this.hostManager.getHostUrl()}/api/search-player`,
      { params }
    );
  }
  getAccountInfo(acocunt_id: string) {
    const params = new HttpParams().set('account-id', acocunt_id);
    return this.http.get(
      `${this.hostManager.getHostUrl()}/api/get-player-info`,
      { params }
    );
  }
  updatePlayer(action: string, account_id: string, duration: number) {
    const params = new HttpParams()
      .set('account-id', account_id)
      .set('action', action)
      .set('duration', duration);
    return this.http.post(
      `${this.hostManager.getHostUrl()}/api/update-player`,
      {},
      { params }
    );
  }
  getRoles() {
    return this.http.get(`${this.hostManager.getHostUrl()}/api/roles`);
  }
  // TODO import modelof roles here
  saveRoles(roles: any) {
    return this.http.post(`${this.hostManager.getHostUrl()}/api/roles`, roles);
  }
  getPerks() {
    return this.http.get(`${this.hostManager.getHostUrl()}/api/perks`);
  }
  updatePerks(perks: any) {
    return this.http.post(`${this.hostManager.getHostUrl()}/api/perks`, perks);
  }
  getConfig() {
    return this.http.get(`${this.hostManager.getHostUrl()}/api/config`);
  }
  updateConfig(config: any) {
    return this.http.post(
      `${this.hostManager.getHostUrl()}/api/config`,
      config
    );
  }
  searchLogs(key: string, db: string) {
    const params = new HttpParams().set('key', key).set('db', db);

    return this.http.get(`${this.hostManager.getHostUrl()}/api/search-logs`, {
      params,
    });
  }
  performAction(action: string, value: string) {
    const params = new HttpParams().set('value', value).set('action', action);

    return this.http.post(
      `${this.hostManager.getHostUrl()}/api/action`,
      {},
      { params }
    );
  }

  // ==================== V2 Endpoints ====================

  getWhitelist(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.hostManager.getHostUrl()}/v2/whitelist`
    );
  }

  updateWhitelist(
    action: 'add' | 'remove',
    account_id: string
  ): Observable<any> {
    return this.http.post(`${this.hostManager.getHostUrl()}/v2/whitelist`, {
      action,
      account_id,
    });
  }

  getBlacklist(): Observable<any> {
    return this.http.get(`${this.hostManager.getHostUrl()}/v2/blacklist`);
  }

  getRecentPlayers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.hostManager.getHostUrl()}/v2/recents`);
  }

  getPlayersV2(
    page: number = 1,
    perPage: number = 50,
    search: string = '',
    sortBy: string = 'server_profile_created_at',
    sortOrder: string = 'desc'
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString())
      .set('sort_by', sortBy)
      .set('sort_order', sortOrder);

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get(`${this.hostManager.getHostUrl()}/v2/players`, {
      params,
    });
  }

  getPlayerDetailsV2(accountId: string): Observable<any> {
    return this.http.get(
      `${this.hostManager.getHostUrl()}/v2/players/${accountId}`
    );
  }

  updatePlayerV2(accountId: string, data: any): Observable<any> {
    return this.http.put(
      `${this.hostManager.getHostUrl()}/v2/players/${accountId}`,
      data
    );
  }

  getPlayerStatsV2(accountId: string): Observable<any> {
    const params = new HttpParams().set('account_id', accountId);
    return this.http.get(`${this.hostManager.getHostUrl()}/v2/player-stats`, {
      params,
    });
  }

  // ==================== V2 Economy & Shop Endpoints ====================

  manageTickets(
    accountId: string,
    amount: number,
    action: 'add' | 'remove' | 'set'
  ): Observable<{ account_id: string; new_balance: number }> {
    return this.http.post<{ account_id: string; new_balance: number }>(
      `${this.hostManager.getHostUrl()}/v2/economy/tickets`,
      {
        account_id: accountId,
        amount,
        action,
      }
    );
  }

  getTransactions(
    page: number = 1,
    perPage: number = 50,
    accountId?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (accountId && accountId.trim()) {
      params = params.set('account_id', accountId.trim());
    }

    return this.http.get(
      `${this.hostManager.getHostUrl()}/v2/economy/transactions`,
      { params }
    );
  }

  getPlayerPurchases(accountId: string): Observable<{
    account_id: string;
    tickets: number;
    purchases: { item_type: string; item_id: string; usages_left: number | null }[];
  }> {
    return this.http.get<{
      account_id: string;
      tickets: number;
      purchases: { item_type: string; item_id: string; usages_left: number | null }[];
    }>(`${this.hostManager.getHostUrl()}/v2/economy/purchases/${accountId}`);
  }

  grantPurchase(
    accountId: string,
    itemType: string,
    itemId: string,
    usagesLeft: number = 3
  ): Observable<any> {
    const body: any = {
      account_id: accountId,
      item_type: itemType,
      item_id: itemId,
    };
    if (itemType === 'command') {
      body.usages_left = usagesLeft;
    }
    return this.http.post(
      `${this.hostManager.getHostUrl()}/v2/economy/purchases`,
      body
    );
  }

  revokePurchase(
    accountId: string,
    itemType: string,
    itemId: string
  ): Observable<any> {
    return this.http.request(
      'DELETE',
      `${this.hostManager.getHostUrl()}/v2/economy/purchases`,
      {
        body: {
          account_id: accountId,
          item_type: itemType,
          item_id: itemId,
        },
      }
    );
  }

  updateCommandUsages(
    accountId: string,
    itemId: string,
    usagesLeft: number
  ): Observable<any> {
    return this.http.put(
      `${this.hostManager.getHostUrl()}/v2/economy/purchases`,
      {
        account_id: accountId,
        item_id: itemId,
        usages_left: usagesLeft,
      }
    );
  }

  getEconomyLeaderboard(limit: number = 20): Observable<
    {
      account_id: string;
      tickets: number;
      name: string;
      v2Tag: string;
    }[]
  > {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<
      {
        account_id: string;
        tickets: number;
        name: string;
        v2Tag: string;
      }[]
    >(`${this.hostManager.getHostUrl()}/v2/economy/leaderboard`, { params });
  }

  getActivePurchasers(
    page: number = 1,
    perPage: number = 50
  ): Observable<{
    purchases: {
      account_id: string;
      item_type: string;
      item_id: string;
      usages_left: number | null;
      name: string;
      v2Tag: string;
    }[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    return this.http.get<{
      purchases: {
        account_id: string;
        item_type: string;
        item_id: string;
        usages_left: number | null;
        name: string;
        v2Tag: string;
      }[];
      total: number;
      page: number;
      per_page: number;
      total_pages: number;
    }>(`${this.hostManager.getHostUrl()}/v2/economy/purchasers`, { params });
  }
}
