import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { AdminService } from "src/app/services/admin.service";

@Component({
  selector: "app-logs-viewer",
  templateUrl: "./logs-viewer.component.html",
  styleUrls: ["./logs-viewer.component.scss"],
})
export class LogsViewerComponent implements OnInit {
  DBS = ["chatlogs.log", "joining.log", "system.log"];
  LOGS = "";
  searchKeyControl: FormControl = new FormControl();
  selectDBControl: FormControl = new FormControl();
  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getDBs("logs").subscribe((data) => {
      this.DBS = data as [];
      this.selectDBControl.setValue(this.DBS[0]);
    });
  }
  onSearch(event: Event) {
    if (
      (event instanceof KeyboardEvent && event.key === "Enter") ||
      event instanceof FocusEvent
    ) {
      this.adminService
        .searchLogs(this.searchKeyControl.value, this.selectDBControl.value)
        .subscribe((data) => {
          this.LOGS = data as string;
        });
    }
  }
}
