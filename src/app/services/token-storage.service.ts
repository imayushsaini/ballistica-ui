import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { SavedTokens } from "../models/shared.model";

const API = environment.API_ENDPOINT;

const TOKEN_KEY = "auth-token";

const LAST_API = "last-api";

@Injectable({
  providedIn: "root",
})
export class TokenStorageService {
  curernt_api: string | null = null;

  addNewApi(api: string) {
    const tokenDict = this.getTokenDict();
    if (tokenDict[api]) {
      return;
    }
    tokenDict[api] = { name: "", token: null };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenDict));
  }

  saveSelectedApi(api: string) {
    localStorage.setItem(LAST_API, api);
  }

  getSelectedApi(): string {
    if (this.curernt_api) return this.curernt_api;
    const savedApi = localStorage.getItem(LAST_API);
    if (savedApi) {
      this.curernt_api = savedApi;
      return savedApi;
    } else {
      this.saveSelectedApi(API);
      this.curernt_api = API;
      return API;
    }
  }

  saveToken(token: string): void {
    const api = this.getSelectedApi();

    const tokenDict = this.getTokenDict();
    if (tokenDict[api]) {
      tokenDict[api]["token"] = token;
    } else {
      tokenDict[api] = { name: "", token: token };
    }

    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenDict));
  }

  updateServerName(api: string, serverName: string): void {
    const tokenDict = this.getTokenDict();
    if (tokenDict[api]) {
      tokenDict[api]["name"] = serverName;
    } else {
      tokenDict[api] = { name: serverName, token: null };
    }

    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenDict));
  }

  public getTokenDict(): SavedTokens {
    const tokenData = localStorage.getItem(TOKEN_KEY);
    if (tokenData) {
      try {
        return JSON.parse(tokenData);
      } catch (error) {
        return {};
      }
    }
    return {};
  }

  public getToken(): string | null {
    const api = this.getSelectedApi();
    const tokenDict = this.getTokenDict();

    return tokenDict[api] ? tokenDict[api]["token"] : null;
  }

  signOut(): void {
    const api = this.getSelectedApi();

    const tokenDict = this.getTokenDict();
    if (tokenDict[api]) {
      tokenDict[api]["token"] = null;
    }
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenDict));
  }
}
