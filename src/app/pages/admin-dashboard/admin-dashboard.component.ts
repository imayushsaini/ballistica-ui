import { Component, OnInit } from "@angular/core";
import { MainService } from "src/app/services/main.service";

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
})
export class AdminDashboardComponent implements OnInit {
  serverName = "";
  ipPort = "";
  constructor(private mainService: MainService) {}
  ngOnInit() {
    this.serverName = this.mainService.getServerName();
    // this.ipPort = this.mainService.getIP();
    this.mainService.gotServerInfo.subscribe(() => {
      this.serverName = this.mainService.getServerName();
      // this.ipPort = this.mainService.getIP();
    });
  }
}
