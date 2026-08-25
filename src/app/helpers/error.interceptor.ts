import { inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private _snackBar = inject(MatSnackBar);

  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Skip popup for background ping / live-stats (handled cleanly on page)
        if (
          !request.url.includes('/api/live-stats') &&
          !request.url.includes('/proxy-ping')
        ) {
          if (error.status >= 500 && error.status < 600) {
            this._snackBar.open(
              'Server Error (HTTP ' + error.status + '). Please verify connection.',
              'OK',
              { duration: 4000 }
            );
          }
        }
        return throwError(error);
      })
    );
  }
}

export const errorInterceptorProvider = [
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
];
