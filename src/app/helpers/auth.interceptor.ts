import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HostManagerService } from '../services/host-manager.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private hostManager: HostManagerService,
    private router: Router
  ) {}

  private handleAuthError(err: HttpErrorResponse): Observable<any> {
    //handle your auth error or rethrow
    if (err.status === 401 && !!this.hostManager.getToken()) {
      // we have wrong password saved, so we need to sign out and delete the cookie
      this.hostManager.signOut();
      // route back to login page
      this.router.navigateByUrl(`/login`);
      // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
      return of(err.message); // or EMPTY may be appropriate here
    }
    return throwError(err);
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let authReq = request;
    const token = this.hostManager.getToken();
    if (token != null) {
      authReq = authReq.clone({
        setHeaders: { 'Secret-Key': token },
      });
    }
    authReq = authReq.clone({
      setHeaders: { 'bs-host': this.hostManager.getSelectedHost() },
    });
    return next
      .handle(authReq)
      .pipe(catchError((err) => this.handleAuthError(err)));
  }
}

export const authInterceptorProvider = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];
