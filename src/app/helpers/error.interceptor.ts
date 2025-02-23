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
import { MatDialog } from '@angular/material/dialog';
import { NetworkErrorDialogComponent } from '../components/network-error-dialog/network-error-dialog.component';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private _snackBar = inject(MatSnackBar);

  private snackBarRef: MatSnackBarRef<any> | null = null;
  constructor(private dialog: MatDialog) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status >= 500 && error.status < 600) {
          // this.dialog.open(NetworkErrorDialogComponent, {});
          if (!this.snackBarRef) {
            this.snackBarRef = this._snackBar.open(
              'Network Error! something is wrong',
              'know more',
              {
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
              }
            );
            this.snackBarRef.afterDismissed().subscribe(() => {
              this.snackBarRef = null;
              this.dialog.open(NetworkErrorDialogComponent, {});
            });
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
