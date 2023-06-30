import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { AdminService } from "src/app/services/admin.service";
import { Router } from "@angular/router";
import { TokenStorageService } from "src/app/services/token-storage.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  passkeyControl: FormControl = new FormControl();
  errorMessage: string | undefined;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private tokenService: TokenStorageService
  ) {}

  ngOnInit() {
    const isLoggedIn = !!this.tokenService.getToken();
    if (isLoggedIn) {
      this.router.navigate(["/", "admin"]);
    }
  }
  onLogin() {
    const passkey = this.passkeyControl.value;

    this.adminService.login(passkey).subscribe(
      () => {
        this.tokenService.saveToken(passkey);
        this.router.navigate(["/", "admin"]);
      },
      (error) => (this.errorMessage = error.error.message)
    );
  }
}
