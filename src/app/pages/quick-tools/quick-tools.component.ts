import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription, interval } from "rxjs";

import { LiveData, Roster } from "src/app/models/live-stats.model";
import { AdminService } from "src/app/services/admin.service";
import { MainService } from "src/app/services/main.service";

@Component({
  selector: "app-quick-tools",
  templateUrl: "./quick-tools.component.html",
  styleUrls: ["./quick-tools.component.scss"],
})
export class QuickToolsComponent implements OnInit, OnDestroy {
  liveChats: string[] = [];
  roster: Roster = {};
  message!: string;
  private updateSubscription!: Subscription;
  constructor(
    private mainservice: MainService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.refreshData();

    this.updateSubscription = interval(9000).subscribe(() => {
      this.refreshData();
    });
  }
  ngOnDestroy() {
    this.updateSubscription.unsubscribe();
  }

  refreshData() {
    this.mainservice.getLiveStats().subscribe((data: LiveData) => {
      this.liveChats = data.chats;
      this.roster = data.roster;
    });
  }
  doAction(type: string) {
    this.adminService.performAction(type, this.message).subscribe((data) => {
      console.log(data);
    });
    if (type === "message") this.message = "";
  }
}
