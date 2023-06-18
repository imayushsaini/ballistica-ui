import { Component } from "@angular/core";
import { MainService } from "src/app/services/main.service";

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
})
export class AdminDashboardComponent {
  serverName = "";
  ipPort = "";
  constructor(private mainService: MainService) {
    this.serverName = mainService.getServerName();
    this.ipPort = mainService.getIP();
  }
}
