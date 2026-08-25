import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HostManagerService } from 'src/app/services/host-manager.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  passkeyControl: FormControl = new FormControl('');
  errorMessage: string | undefined;
  authRequiredNotice: boolean = false;
  returnUrl: string = '/admin';
  hidePassword = true;
  isLoading = false;
  activeHost = '';

  constructor(
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute,
    private hostManager: HostManagerService
  ) {}

  ngOnInit() {
    this.activeHost = this.hostManager.getSelectedHost();

    this.route.queryParams.subscribe((params) => {
      if (params['reason'] === 'auth_required') {
        this.authRequiredNotice = true;
      }
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });

    const isLoggedIn = this.hostManager.isAuthenticated();
    if (isLoggedIn) {
      this.router.navigateByUrl(this.returnUrl);
    }

    this.hostManager.onServerChange.subscribe((newHost) => {
      this.activeHost = newHost;
      if (this.hostManager.isAuthenticated(newHost)) {
        this.router.navigateByUrl(this.returnUrl);
      }
    });
  }

  onLogin() {
    const passkey = this.passkeyControl.value;
    if (!passkey || !passkey.trim()) return;

    this.isLoading = true;
    this.errorMessage = undefined;

    this.adminService.login(passkey.trim()).subscribe({
      next: () => {
        this.isLoading = false;
        this.hostManager.saveHostToken(
          this.hostManager.getSelectedHost(),
          passkey.trim()
        );
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error?.error?.message ||
          error?.error ||
          'Authentication failed. Please verify your server secret key.';
      },
    });
  }
}
