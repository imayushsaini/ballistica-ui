import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription, interval } from "rxjs";

import { LiveData, Roster } from "src/app/models/live-stats.model";
import { AdminService } from "src/app/services/admin.service";
import { MainService } from "src/app/services/main.service";

@Component({
  selector: "app-quick-tools",
  templateUrl: "./quick-tools.component.html",
  styleUrls: ["./quick-tools.component.scss"],
  standalone: false,
})
export class QuickToolsComponent implements OnInit, OnDestroy {
  liveChats: string[] = [];
  roster: Roster = {};
  message: string = "";
  recents: any[] = [];
  isSending = false;
  private updateSubscription!: Subscription;

  constructor(
    private mainservice: MainService,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.refreshData();
    this.fetchRecents();

    this.updateSubscription = interval(6000).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  refreshData() {
    this.mainservice.getLiveStats().subscribe((data: LiveData) => {
      this.liveChats = data.chats || [];
      this.roster = data.roster || {};
    });
  }

  fetchRecents() {
    this.adminService.getRecentPlayers().subscribe({
      next: (data) => {
        this.recents = data || [];
      },
      error: () => {
        // V2 recents fallback
      },
    });
  }

  sendMessage() {
    if (!this.message || !this.message.trim()) return;
    const msgToSend = this.message.trim();
    this.isSending = true;

    this.adminService.performAction("message", msgToSend).subscribe({
      next: () => {
        this.isSending = false;
        this.message = "";
        this.snackBar.open("Broadcast sent to in-game chat", "OK", {
          duration: 3000,
        });
        setTimeout(() => this.refreshData(), 500);
      },
      error: (err) => {
        this.isSending = false;
        this.snackBar.open(
          "Failed to send broadcast: " + (err?.error?.message || err?.message),
          "OK",
          { duration: 4000 }
        );
      },
    });
  }

  onQuickKick(clientId: number, name: string) {
    if (confirm(`Kick player "${name}" (Client #${clientId}) from the server?`)) {
      this.adminService.performAction("kick", clientId.toString()).subscribe({
        next: () => {
          this.snackBar.open(`Kicked ${name}`, "OK", { duration: 3000 });
          this.refreshData();
        },
        error: (err) => {
          this.snackBar.open(
            "Kick action failed: " + (err?.error?.message || err?.message),
            "OK",
            { duration: 4000 }
          );
        },
      });
    }
  }

  onQuickMute(accountId: string, name: string) {
    if (confirm(`Mute player "${name}" (${accountId}) for 1 day?`)) {
      this.adminService.updatePlayer("mute", accountId, 1).subscribe({
        next: () => {
          this.snackBar.open(`Muted ${name} for 1 day`, "OK", {
            duration: 3000,
          });
        },
        error: (err) => {
          this.snackBar.open("Mute failed: " + (err?.error?.message || err?.message), "OK", { duration: 4000 });
        },
      });
    }
  }

  onQuickBan(accountId: string, name: string) {
    if (confirm(`BAN player "${name}" (${accountId}) for 7 days?`)) {
      this.adminService.updatePlayer("ban", accountId, 7).subscribe({
        next: () => {
          this.snackBar.open(`Banned ${name} for 7 days`, "OK", {
            duration: 4000,
          });
          this.refreshData();
        },
        error: (err) => {
          this.snackBar.open("Ban failed: " + (err?.error?.message || err?.message), "OK", { duration: 4000 });
        },
      });
    }
  }

  onRestartServer() {
    if (
      confirm(
        "Are you sure you want to RESTART / QUIT the server process? Connected players will disconnect."
      )
    ) {
      this.adminService.performAction("quit", "").subscribe({
        next: () => {
          this.snackBar.open(
            "Restart command issued to server process",
            "OK",
            { duration: 4000 }
          );
        },
        error: (err) => {
          this.snackBar.open("Server command failed: " + (err?.error?.message || err?.message), "OK", { duration: 4000 });
        },
      });
    }
  }
}
