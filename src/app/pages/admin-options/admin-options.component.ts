import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TokenStorageService } from "src/app/services/token-storage.service";

@Component({
  selector: "app-admin-options",
  templateUrl: "./admin-options.component.html",
  styleUrls: ["./admin-options.component.scss"],
})
export class AdminOptionsComponent implements OnInit {
  constructor(
    private router: Router,
    private tokenService: TokenStorageService
  ) {}

  ngOnInit() {
    const isLoggedIn = !!this.tokenService.getToken();
    if (isLoggedIn) {
      this.router.navigate(["/", "admin"]);
    }
  }
}
