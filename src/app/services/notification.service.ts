import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TokenStorageService } from "./token-storage.service";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  api: string;
  constructor(
    private http: HttpClient,
    private tokenService: TokenStorageService
  ) {
    this.api = tokenService.getSelectedApi();
  }
  subscribe(subscription: any) {
    return this.http.post(`${this.api}/api/subscribe`, subscription);
  }
  triggerMessage(message: any) {
    return this.http.post("/message", JSON.parse(message));
  }
}
