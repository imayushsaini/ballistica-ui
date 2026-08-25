import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { HostManagerService } from '../services/host-manager.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate, CanActivateChild {
  constructor(
    private hostManager: HostManagerService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkAuth(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkAuth(state.url);
  }

  private checkAuth(targetUrl: string): boolean | UrlTree {
    const isAuth = this.hostManager.isAuthenticated();
    if (isAuth) {
      return true;
    }
    // Redirect to login with reason
    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: targetUrl, reason: 'auth_required' },
    });
  }
}
