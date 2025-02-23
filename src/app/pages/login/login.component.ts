import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { Router } from '@angular/router';
import { HostManagerService } from 'src/app/services/host-manager.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  passkeyControl: FormControl = new FormControl();
  errorMessage: string | undefined;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private hostManager: HostManagerService
  ) {}

  ngOnInit() {
    const isLoggedIn = !!this.hostManager.getToken();
    if (isLoggedIn) {
      this.router.navigate(['/', 'admin']);
    }
  }
  onLogin() {
    const passkey = this.passkeyControl.value;

    this.adminService.login(passkey).subscribe(
      () => {
        this.hostManager.saveHostToken(
          this.hostManager.getSelectedHost(),
          passkey
        );
        this.router.navigate(['/', 'admin']);
      },
      (error) => (this.errorMessage = error.error.message)
    );
  }
}
