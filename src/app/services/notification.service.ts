import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HostManagerService } from './host-manager.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private http: HttpClient,
    private hostManager: HostManagerService
  ) {}
  subscribe(subscription: any) {
    return this.http.post(
      `${this.hostManager.getProxyUrl()}/api/subscribe`,
      subscription
    );
  }
  triggerMessage(message: any) {
    return this.http.post('/message', JSON.parse(message));
  }
}
