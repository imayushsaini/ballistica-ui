import { Injectable } from '@angular/core';
import { Cache, Host } from '../models/shared.model';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs/internal/Subject';

const HOST_DB = 'HOST-db';
const CACHE = 'cache';
const DEFAULT_HOST = environment.HOST;
@Injectable({
  providedIn: 'root',
})
export class HostManagerService {
  onServerChange = new Subject<string>();
  currentHost: string | null = null;
  constructor() {}

  getHostDB(): Host {
    const hostDb = localStorage.getItem(HOST_DB);
    if (hostDb) {
      try {
        return JSON.parse(hostDb);
      } catch (error) {
        console.error('Error parsing host db', error);
        return {};
      }
    }
    return {};
  }
  getCache(): Cache {
    const cache = localStorage.getItem(CACHE);
    if (cache) {
      try {
        return JSON.parse(cache);
      } catch (error) {
        console.error('Error parsing cache', error);
        return { currentHost: null, proxyUrl: null };
      }
    }
    return { currentHost: null, proxyUrl: null };
  }

  getProxyUrl(): string {
    const cache = this.getCache();
    if (cache.proxyUrl) {
      return cache.proxyUrl;
    }
    return environment.API_PROXY;
  }
  setProxyUrl(url: string) {
    const cache = this.getCache();
    cache.proxyUrl = url;
    localStorage.setItem(CACHE, JSON.stringify(cache));
  }
  addNewHost(host: string) {
    const hostDict = this.getHostDB();
    if (hostDict[host]) {
      // if already exists dont do any thing
      return;
    }
    hostDict[host] = { name: '', token: null };
    localStorage.setItem(HOST_DB, JSON.stringify(hostDict));
  }

  saveHostName(host: string, name: string) {
    const hostDb = this.getHostDB();
    if (hostDb[host]) {
      hostDb[host].name = name;
      localStorage.setItem(HOST_DB, JSON.stringify(hostDb));
    } else {
      hostDb[host] = { name: name, token: null };
      localStorage.setItem(HOST_DB, JSON.stringify(hostDb));
    }
  }

  saveHostToken(host: string, token: string) {
    const hostDb = this.getHostDB();
    if (hostDb[host]) {
      hostDb[host].token = token;
      localStorage.setItem(HOST_DB, JSON.stringify(hostDb));
    } else {
      hostDb[host] = { name: '', token: token };
      localStorage.setItem(HOST_DB, JSON.stringify(hostDb));
    }
  }

  getToken(): string | null {
    this.currentHost = this.getSelectedHost();
    const hostdb = this.getHostDB();
    if (this.currentHost && hostdb[this.currentHost]) {
      return hostdb[this.currentHost].token;
    }
    return null;
  }

  getSelectedHost(): string {
    if (this.currentHost) {
      return this.currentHost;
    }
    // lets check if we have anything saved in browser cache
    const savedHost = this.getCache().currentHost;
    if (savedHost) {
      this.currentHost = savedHost;
      return this.currentHost;
    } else {
      // now check if we have default host in our environment variable
      this.currentHost = DEFAULT_HOST;
      // save it in cache and host db
      const cache = this.getCache();
      cache.currentHost = this.currentHost;
      this.addNewHost(this.currentHost);
      localStorage.setItem(CACHE, JSON.stringify(cache));
      return this.currentHost;
    }
  }

  switchHost(host: string) {
    this.currentHost = host;
    const cache = this.getCache();
    cache.currentHost = host;
    localStorage.setItem(CACHE, JSON.stringify(cache));
    this.onServerChange.next(host);
    return this.currentHost;
  }

  signOut() {
    this.currentHost = this.getSelectedHost();
    const hostdb = this.getHostDB();
    if (this.currentHost && hostdb[this.currentHost]) {
      hostdb[this.currentHost].token = null;
      localStorage.setItem(HOST_DB, JSON.stringify(hostdb));
    }
  }
}
