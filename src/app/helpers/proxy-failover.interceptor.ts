import { inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HTTP_INTERCEPTORS,
  HttpContextToken,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HostManagerService } from '../services/host-manager.service';

/**
 * HttpContextToken to track which proxies have already been attempted for a specific HTTP request.
 * Using HttpContext prevents modifying HTTP headers and avoids CORS preflight complications.
 */
export const ATTEMPTED_PROXIES = new HttpContextToken<string[]>(() => []);

@Injectable()
export class ProxyFailoverInterceptor implements HttpInterceptor {
  private hostManager = inject(HostManagerService);
  private snackBar = inject(MatSnackBar);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Skip proxy ping health-checks so testing individual proxies remains accurate
    if (request.url.includes('/proxy-ping')) {
      return next.handle(request);
    }

    const proxyList = this.hostManager.getProxyList();
    // Identify if the request URL matches any configured proxy base URL
    const matchedProxy = proxyList.find((proxy) =>
      request.url.startsWith(proxy)
    );

    // If not a proxy request or there are no alternate proxies, proceed normally
    if (!matchedProxy || proxyList.length <= 1) {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Failover criteria:
        // Status 0: Unreachable, DNS lookup fail, CORS/network connection failure
        // Status 502: Bad Gateway
        // Status 503: Service Unavailable
        // Status 504: Gateway Timeout
        const isProxyFailure =
          error.status === 0 ||
          error.status === 502 ||
          error.status === 503 ||
          error.status === 504;

        if (!isProxyFailure) {
          return throwError(() => error);
        }

        const attempted = [...(request.context.get(ATTEMPTED_PROXIES) || [])];
        if (!attempted.includes(matchedProxy)) {
          attempted.push(matchedProxy);
        }

        // Find candidate proxies that haven't been tried yet for this request
        const candidateProxies = proxyList.filter(
          (p) => !attempted.includes(p)
        );

        if (candidateProxies.length === 0) {
          // All proxies have been attempted and failed
          return throwError(() => error);
        }

        const nextProxy = candidateProxies[0];
        console.warn(
          `[ProxyFailover] Proxy "${matchedProxy}" failed (status ${error.status}). Auto-switching to backup proxy "${nextProxy}".`
        );

        // Update active proxy in hostManager so future requests use the working proxy immediately
        this.hostManager.setActiveProxy(nextProxy, true);

        // Replace the failed proxy URL prefix with the new proxy URL
        const newUrl = request.url.replace(matchedProxy, nextProxy);

        // Update HttpContext with attempted proxies list
        const updatedContext = request.context.set(
          ATTEMPTED_PROXIES,
          attempted
        );

        const retryRequest = request.clone({
          url: newUrl,
          context: updatedContext,
        });

        // Notify user about the proxy auto-switch
        this.snackBar.open(
          `Connection issue on current proxy. Switched to ${nextProxy}`,
          'OK',
          { duration: 3500 }
        );

        return next.handle(retryRequest);
      })
    );
  }
}

export const proxyFailoverInterceptorProvider = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ProxyFailoverInterceptor,
    multi: true,
  },
];
