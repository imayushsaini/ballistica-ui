import { Injectable, OnDestroy } from '@angular/core';
import { HttpRequest, HttpResponse, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { HostManagerService } from './host-manager.service';

interface PendingRequest {
  subject: Subject<HttpResponse<any>>;
  timeoutTimer: any;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private requestCounter = 0;
  public isConnected$ = new BehaviorSubject<boolean>(false);
  private connectionPromise: Promise<boolean> | null = null;

  constructor(private hostManager: HostManagerService) {
    // Reconnect whenever the active proxy, selected host, or WS toggle state changes
    this.hostManager.onProxyChange.subscribe(() => this.reconnect());
    this.hostManager.onServerChange.subscribe(() => this.reconnect());
    this.hostManager.onWebSocketToggle.subscribe((enabled) => {
      if (enabled) {
        this.connect();
      } else {
        this.closeSocket();
      }
    });
  }

  ngOnDestroy(): void {
    this.closeSocket();
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  public connect(): Promise<boolean> {
    if (this.isConnected()) {
      return Promise.resolve(true);
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    const proxyUrl = this.hostManager.getProxyUrl();
    const targetHost = this.hostManager.getSelectedHost();

    // If target host is local IP or WS mode disabled, skip proxy WebSocket
    if (!this.hostManager.isWebSocketEnabled() || this.hostManager.isLocalIp(targetHost)) {
      return Promise.resolve(false);
    }

    // Convert http(s):// to ws(s)://
    let wsUrl = proxyUrl.replace(/^http:/i, 'ws:').replace(/^https:/i, 'wss:');
    wsUrl = `${wsUrl.replace(/\/+$/, '')}/?bs-host=${encodeURIComponent(targetHost)}`;

    this.connectionPromise = new Promise<boolean>((resolve) => {
      try {
        this.closeSocket(false);
        console.log('[WebSocketService] Connecting to proxy WebSocket:', wsUrl);
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('[WebSocketService] WebSocket connected successfully');
          this.isConnected$.next(true);
          this.connectionPromise = null;
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          this.handleIncomingMessage(event.data);
        };

        this.socket.onerror = (error) => {
          console.error('[WebSocketService] WebSocket error:', error);
          this.isConnected$.next(false);
          this.connectionPromise = null;
          resolve(false);
        };

        this.socket.onclose = () => {
          console.log('[WebSocketService] WebSocket connection closed');
          this.isConnected$.next(false);
          this.connectionPromise = null;
        };
      } catch (err) {
        console.error('[WebSocketService] Failed to instantiate WebSocket:', err);
        this.isConnected$.next(false);
        this.connectionPromise = null;
        resolve(false);
      }
    });

    return this.connectionPromise;
  }

  public reconnect(): void {
    this.closeSocket();
    if (this.hostManager.isWebSocketEnabled()) {
      this.connect();
    }
  }

  public sendHttpRequest(req: HttpRequest<any>): Observable<HttpResponse<any>> {
    const requestId = `ws-req-${++this.requestCounter}-${Date.now()}`;
    const responseSubject = new Subject<HttpResponse<any>>();

    const execute = async () => {
      const connected = await this.connect();
      if (!connected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
        responseSubject.error(
          new HttpErrorResponse({
            error: 'WebSocket connection unavailable',
            status: 0,
            statusText: 'WebSocket Unavailable',
            url: req.url,
          })
        );
        return;
      }

      // Convert HttpRequest headers
      const headersObj: Record<string, string> = {};
      req.headers.keys().forEach((key) => {
        const val = req.headers.get(key);
        if (val !== null) {
          headersObj[key] = val;
        }
      });

      // Ensure Content-Type is set if body is present
      const hasContentType = Object.keys(headersObj).some(
        (k) => k.toLowerCase() === 'content-type'
      );
      if (!hasContentType && req.body !== null && req.body !== undefined) {
        headersObj['Content-Type'] = 'application/json';
      }

      // Extract path relative to proxy or full pathname + query string
      let path = req.url;
      try {
        const parsed = new URL(req.url);
        path = parsed.pathname + parsed.search;
      } catch {
        // req.url is relative e.g. /api/live-stats
      }

      const payload = {
        id: requestId,
        path: path,
        method: req.method,
        headers: headersObj,
        body: req.body,
        'bs-host': this.hostManager.getSelectedHost(),
      };

      const timeoutTimer = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          responseSubject.error(
            new HttpErrorResponse({
              error: 'WebSocket request timed out after 15s',
              status: 504,
              statusText: 'Gateway Timeout',
              url: req.url,
            })
          );
        }
      }, 15000);

      this.pendingRequests.set(requestId, { subject: responseSubject, timeoutTimer });

      try {
        this.socket.send(JSON.stringify(payload));
      } catch (err) {
        clearTimeout(timeoutTimer);
        this.pendingRequests.delete(requestId);
        responseSubject.error(
          new HttpErrorResponse({
            error: (err as Error).message || 'Failed to send over WebSocket',
            status: 0,
            statusText: 'WebSocket Send Failure',
            url: req.url,
          })
        );
      }
    };

    execute();
    return responseSubject.asObservable();
  }

  private handleIncomingMessage(dataStr: string): void {
    try {
      const msg = JSON.parse(dataStr);
      if (!msg || !msg.id) return;

      const pending = this.pendingRequests.get(msg.id);
      if (!pending) return;

      clearTimeout(pending.timeoutTimer);
      this.pendingRequests.delete(msg.id);

      if (msg.ok || (msg.status >= 200 && msg.status < 300)) {
        const httpHeaders = new HttpHeaders(msg.headers || {});
        const httpRes = new HttpResponse({
          body: msg.data,
          headers: httpHeaders,
          status: msg.status || 200,
          statusText: 'OK',
          url: msg.path,
        });
        pending.subject.next(httpRes);
        pending.subject.complete();
      } else {
        const httpError = new HttpErrorResponse({
          error: msg.data || msg.message || msg.error || 'WebSocket request failed',
          headers: new HttpHeaders(msg.headers || {}),
          status: msg.status || 500,
          statusText: msg.error || 'Bad Gateway',
          url: msg.path,
        });
        pending.subject.error(httpError);
      }
    } catch (err) {
      console.error('[WebSocketService] Error parsing incoming WS frame:', err);
    }
  }

  private closeSocket(notify = true): void {
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }
      this.socket = null;
    }
    for (const pending of this.pendingRequests.values()) {
      clearTimeout(pending.timeoutTimer);
      pending.subject.error(
        new HttpErrorResponse({
          error: 'WebSocket connection closed',
          status: 0,
          statusText: 'WebSocket Closed',
        })
      );
    }
    this.pendingRequests.clear();
    if (notify) {
      this.isConnected$.next(false);
    }
  }
}
