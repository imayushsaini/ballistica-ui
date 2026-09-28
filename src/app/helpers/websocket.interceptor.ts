import { inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HostManagerService } from '../services/host-manager.service';
import { WebSocketService } from '../services/websocket.service';

@Injectable()
export class WebSocketInterceptor implements HttpInterceptor {
  private hostManager = inject(HostManagerService);
  private wsService = inject(WebSocketService);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // 1. Skip if WebSocket mode is disabled
    if (!this.hostManager.isWebSocketEnabled()) {
      return next.handle(request);
    }

    // 2. Skip proxy-ping health checks (keep ping requests as raw HTTP)
    if (request.url.includes('/proxy-ping')) {
      return next.handle(request);
    }

    const selectedHost = this.hostManager.getSelectedHost();

    // 3. Skip if connecting directly to local IP host
    if (this.hostManager.isLocalIp(selectedHost)) {
      return next.handle(request);
    }

    // 4. Identify if request is directed to proxy
    const proxyList = this.hostManager.getProxyList();
    const isProxyRequest =
      proxyList.some((proxy) => request.url.startsWith(proxy)) ||
      request.url.startsWith(this.hostManager.getProxyUrl()) ||
      !request.url.startsWith('http');

    if (!isProxyRequest) {
      return next.handle(request);
    }

    // 5. Route request over WebSocket with HTTP REST failover
    return this.wsService.sendHttpRequest(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If WebSocket is unavailable or failed to connect, fall back seamlessly to HTTP REST
        if (error.status === 0 || error.statusText?.includes('WebSocket')) {
          console.warn(
            '[WebSocketInterceptor] WebSocket request failed, falling back to HTTP REST:',
            error.message
          );
          return next.handle(request);
        }
        return throwError(() => error);
      })
    );
  }
}

export const webSocketInterceptorProvider = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: WebSocketInterceptor,
    multi: true,
  },
];
