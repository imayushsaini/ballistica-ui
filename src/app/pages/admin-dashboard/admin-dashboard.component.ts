import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HostManagerService } from "src/app/services/host-manager.service";
import { MainService } from "src/app/services/main.service";

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
  standalone: false,
})
export class AdminDashboardComponent implements OnInit {
  serverName = "";
  activeHost = "";

  constructor(
    private mainService: MainService,
    private hostManager: HostManagerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.activeHost = this.hostManager.getSelectedHost();
    this.serverName = this.mainService.getServerName();
    this.mainService.gotServerInfo.subscribe(() => {
      this.serverName = this.mainService.getServerName();
    });
    this.hostManager.onServerChange.subscribe(() => {
      this.activeHost = this.hostManager.getSelectedHost();
      this.serverName = this.mainService.getServerName();
    });
  }

  onSignOut() {
    this.hostManager.signOut();
    this.router.navigate(["/", "login"]);
  }
}
