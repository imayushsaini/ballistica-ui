import { Injectable } from '@angular/core';
import { Cache, Host } from '../models/shared.model';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

const HOST_DB = 'HOST-db';
const PROXIES_DB = 'PROXIES-db';
const CACHE = 'cache';
const LOCAL_HOST = '127.0.0.1:43210';
const DEFAULT_HOST = environment.DEFAULT_HOST;
const DEFAULT_PROXY = environment.API_PROXY;

@Injectable({
  providedIn: 'root',
})
export class HostManagerService {
  onServerChange = new Subject<string>();
  onAuthChange = new Subject<boolean>();
  onProxyChange = new Subject<string>();
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

  // ==================== Multiple Proxies Management ====================

  getDefaultProxies(): string[] {
    const envProxies: string[] =
      (environment as any).API_PROXIES ||
      (DEFAULT_PROXY ? [DEFAULT_PROXY] : []);

    return Array.from(
      new Set(
        envProxies
          .map((u) => (u || '').trim().replace(/\/+$/, ''))
          .filter((u) => !!u)
      )
    );
  }

  getProxyList(): string[] {
    const defaultList = this.getDefaultProxies();
    const stored = localStorage.getItem(PROXIES_DB);
    if (stored) {
      try {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          const cleanStored = list
            .map((u) => (u || '').trim().replace(/\/+$/, ''))
            .filter((u) => !!u);
          // Always ensure configured default proxies are included in the available list
          const merged = Array.from(new Set([...cleanStored, ...defaultList]));
          if (merged.length !== list.length) {
            this.saveProxyList(merged);
          }
          return merged;
        }
      } catch (e) {
        console.error('Error parsing proxies db', e);
      }
    }
    this.saveProxyList(defaultList);
    return defaultList;
  }

  saveProxyList(list: string[]): void {
    const cleanList = Array.from(
      new Set(list.map((u) => u.trim().replace(/\/+$/, '')).filter((u) => !!u))
    );
    localStorage.setItem(PROXIES_DB, JSON.stringify(cleanList));
  }

  addProxy(url: string): void {
    if (!url) return;
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const list = this.getProxyList();
    if (!list.includes(cleanUrl)) {
      list.push(cleanUrl);
      this.saveProxyList(list);
    }
  }

  deleteProxy(url: string): void {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    let list = this.getProxyList().filter((p) => p !== cleanUrl);
    if (list.length === 0) {
      list = this.getDefaultProxies();
    }
    this.saveProxyList(list);

    // If active proxy was deleted, switch to the first remaining proxy
    if (this.getProxyUrl() === cleanUrl) {
      this.setActiveProxy(list[0]);
    }
  }

  getProxyUrl(): string {
    const cache = this.getCache();
    const defaultProxy = this.getDefaultProxies()[0] || DEFAULT_PROXY;
    let proxyUrl = cache.proxyUrl ? cache.proxyUrl : defaultProxy;
    proxyUrl = (proxyUrl || '').replace(/\/+$/, '');
    return proxyUrl;
  }

  setProxyUrl(url: string): void {
    this.setActiveProxy(url);
  }

  setActiveProxy(url: string, notify: boolean = true): void {
    if (!url) return;
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cache = this.getCache();
    cache.proxyUrl = cleanUrl;
    localStorage.setItem(CACHE, JSON.stringify(cache));
    this.addProxy(cleanUrl);
    if (notify) {
      this.onProxyChange.next(cleanUrl);
    }
  }

  switchToNextProxy(failedProxyUrl?: string): string {
    const list = this.getProxyList();
    if (list.length <= 1) {
      return this.getProxyUrl();
    }
    const current = (failedProxyUrl || this.getProxyUrl()).trim().replace(/\/+$/, '');
    const currentIndex = list.indexOf(current);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % list.length : 0;
    const nextProxy = list[nextIndex];
    this.setActiveProxy(nextProxy, true);
    return nextProxy;
  }

  async findAndSetHealthyProxy(timeoutMs: number = 3000): Promise<string | null> {
    const list = this.getProxyList();
    if (list.length === 0) return null;

    const checkProxy = async (
      url: string
    ): Promise<{ url: string; ok: boolean; latency: number }> => {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(`${url}/proxy-ping`, {
          signal: controller.signal,
          method: 'GET',
        });
        clearTimeout(timeoutId);
        return { url, ok: res.ok, latency: Date.now() - start };
      } catch {
        return { url, ok: false, latency: Infinity };
      }
    };

    const results = await Promise.all(list.map((u) => checkProxy(u)));
    const healthy = results
      .filter((r) => r.ok)
      .sort((a, b) => a.latency - b.latency);

    if (healthy.length > 0) {
      const best = healthy[0].url;
      if (this.getProxyUrl() !== best) {
        this.setActiveProxy(best, true);
      }
      return best;
    }
    return null;
  }

  // ==================== Local IP Detection ====================

  isLocalIp(host: string = this.getSelectedHost()): boolean {
    if (!host) {
      return false;
    }
    const cleanHost = host
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      .split('?')[0];
    let ip = cleanHost;
    if (cleanHost.startsWith('[') && cleanHost.includes(']')) {
      ip = cleanHost.substring(1, cleanHost.indexOf(']'));
    } else if (cleanHost.includes(':')) {
      ip = cleanHost.split(':')[0];
    }
    ip = ip.trim().toLowerCase();

    if (
      ip === 'localhost' ||
      ip === '0.0.0.0' ||
      ip === '::1' ||
      ip.endsWith('.local') ||
      ip.endsWith('.localhost')
    ) {
      return true;
    }

    const ipv4Match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const octets = ipv4Match.slice(1, 5).map(Number);
      if (octets.some((octet) => octet > 255)) {
        return false;
      }
      const [o1, o2] = octets;
      // 127.0.0.0/8 (Loopback)
      if (o1 === 127) return true;
      // 10.0.0.0/8 (Private network)
      if (o1 === 10) return true;
      // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
      if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
      // 192.168.0.0/16 (Private network)
      if (o1 === 192 && o2 === 168) return true;
      // 169.254.0.0/16 (Link-local)
      if (o1 === 169 && o2 === 254) return true;
      // 0.0.0.0/8
      if (o1 === 0) return true;
    }

    if (ip.startsWith('fe80:') || ip.startsWith('fc') || ip.startsWith('fd')) {
      return true;
    }

    return false;
  }

  getHostUrl(host: string = this.getSelectedHost()): string {
    if (this.isLocalIp(host)) {
      const formattedHost =
        host.startsWith('http://') || host.startsWith('https://')
          ? host
          : `http://${host}`;
      return formattedHost.replace(/\/$/, '');
    }
    return this.getProxyUrl();
  }

  // ==================== Host & Token Management ====================

  addNewHost(host: string) {
    const hostDict = this.getHostDB();
    if (hostDict[host]) {
      return;
    }
    hostDict[host] = { name: '', token: null };
    localStorage.setItem(HOST_DB, JSON.stringify(hostDict));
  }

  deleteHost(host: string) {
    const hostDict = this.getHostDB();
    if (hostDict[host]) {
      delete hostDict[host];
      localStorage.setItem(HOST_DB, JSON.stringify(hostDict));
    }
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
    this.onAuthChange.next(true);
  }

  getToken(host: string = this.getSelectedHost()): string | null {
    const hostdb = this.getHostDB();
    if (host && hostdb[host] && hostdb[host].token) {
      return hostdb[host].token;
    }
    return null;
  }

  isAuthenticated(host: string = this.getSelectedHost()): boolean {
    return !!this.getToken(host);
  }

  getSelectedHost(): string {
    if (this.currentHost) {
      return this.currentHost;
    }
    const savedHost = this.getCache().currentHost;
    if (savedHost) {
      this.currentHost = savedHost;
      return this.currentHost;
    } else {
      this.currentHost = DEFAULT_HOST;
      const cache = this.getCache();
      cache.currentHost = this.currentHost;
      if (this.currentHost !== LOCAL_HOST) {
        this.addNewHost(this.currentHost);
      }
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
    this.onAuthChange.next(this.isAuthenticated(host));
    return this.currentHost;
  }

  signOut(host: string = this.getSelectedHost()) {
    const hostdb = this.getHostDB();
    if (host && hostdb[host]) {
      hostdb[host].token = null;
      localStorage.setItem(HOST_DB, JSON.stringify(hostdb));
    }
    this.onAuthChange.next(false);
  }
}
