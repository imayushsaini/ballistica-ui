import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { AdminService } from "src/app/services/admin.service";

@Component({
  selector: "app-logs-viewer",
  templateUrl: "./logs-viewer.component.html",
  styleUrls: ["./logs-viewer.component.scss"],
  standalone: false,
})
export class LogsViewerComponent implements OnInit {
  DBS: string[] = ["chatlogs.log", "joining.log", "system.log"];
  LOGS = "";
  logLines: string[] = [];
  searchKeyControl: FormControl = new FormControl("");
  selectDBControl: FormControl = new FormControl("chatlogs.log");
  isLoading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getDBs("logs").subscribe({
      next: (data) => {
        const dbs = (data as string[]) || [];
        if (dbs.length > 0) {
          this.DBS = dbs;
          this.selectDBControl.setValue(this.DBS[0]);
        }
        this.fetchLogs();
      },
      error: () => {
        this.fetchLogs();
      },
    });

    this.selectDBControl.valueChanges.subscribe(() => {
      this.fetchLogs();
    });
  }

  fetchLogs() {
    this.isLoading = true;
    const query = this.searchKeyControl.value || "";
    const db = this.selectDBControl.value || this.DBS[0];

    this.adminService.searchLogs(query, db).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        if (Array.isArray(data)) {
          this.logLines = data.map((l) =>
            typeof l === "object" ? JSON.stringify(l) : String(l)
          );
          this.LOGS = this.logLines.join("\n");
        } else if (typeof data === "string") {
          this.LOGS = data;
          this.logLines = this.LOGS
            .split("\n")
            .filter((l) => l.trim().length > 0);
        } else if (data && typeof data === "object") {
          if (Array.isArray(data.logs)) {
            this.logLines = data.logs.map((l: any) => String(l));
          } else if (Array.isArray(data.lines)) {
            this.logLines = data.lines.map((l: any) => String(l));
          } else if (typeof data.logs === "string") {
            this.logLines = data.logs.split("\n");
          } else {
            this.logLines = Object.values(data).map((v) =>
              typeof v === "object" ? JSON.stringify(v) : String(v)
            );
          }
          this.LOGS = this.logLines.join("\n");
        } else {
          this.LOGS = "";
          this.logLines = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.LOGS =
          "Failed to load log entries: " +
          (err?.error?.message || err?.message || "Unknown error");
        this.logLines = [this.LOGS];
      },
    });
  }

  onSearch(event?: Event) {
    if (
      !event ||
      (event instanceof KeyboardEvent && event.key === "Enter") ||
      event instanceof FocusEvent
    ) {
      this.fetchLogs();
    }
  }

  clearSearch() {
    this.searchKeyControl.setValue("");
    this.fetchLogs();
  }
}
