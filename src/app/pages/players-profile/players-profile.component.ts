import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CustomDialogComponent } from "src/app/components/dialog/custom-dialog";
import { AdminService } from "src/app/services/admin.service";

interface Profile {
  display_string: string[];
  profiles: [];
  name: string;
  isBan: boolean;
  isMuted: boolean;
  accountAge: string;
  registerOn: number;
  canStartKickVote: boolean;
  spamCount: number;
  lastSpam: number;
  totaltimeplayer: number;
  lastseen: number;
  warnCount: number;
  lastWarned: number;
  verified: boolean;
  rejoincount: number;
  lastJoin: number;
  cMsgCount: number;
  lastMsgTime: number;
  lastMsg: string;
  cSameMsg: number;
  lastIP: string;
  deviceUUID: string;
}

interface Profiles {
  [key: string]: Profile;
}

interface AccountInfo {
  extra: string;
  isBan: boolean;
  isKickVoteDisabled: boolean;
  isMuted: boolean;
}

interface RestrictionMap {
  [key: string]: AccountInfo;
}

interface BanEntry {
  reason?: string;
  till?: string;
}

interface BlacklistData {
  ban?: {
    ids?: Record<string, BanEntry>;
    ips?: Record<string, BanEntry>;
    deviceids?: Record<string, BanEntry>;
  };
  "muted-ids"?: Record<string, BanEntry>;
  "kick-vote-disabled"?: Record<string, { till?: string }>;
}

@Component({
  selector: "app-players-profile",
  templateUrl: "./players-profile.component.html",
  styleUrls: ["./players-profile.component.scss"],
  providers: [DatePipe],
  standalone: false,
})
export class PlayersProfileComponent implements OnInit {
  // Active Tab Index
  activeTabIndex = 0;

  // --- V2 SQLite Database State ---
  playersV2: any[] = [];
  totalPlayersV2 = 0;
  currentPageV2 = 1;
  perPageV2 = 25;
  searchQueryV2 = "";
  sortByV2 = "server_profile_created_at";
  sortOrderV2: "asc" | "desc" = "desc";
  isLoadingV2 = false;
  selectedPlayerV2: any = null;
  isLoadingPlayerDetails = false;
  isSavingPlayer = false;
  editForm!: FormGroup;

  // --- V2 Security Center (Whitelist, Blacklist & Kick Vote) State ---
  whitelist: string[] = [];
  blacklist: BlacklistData | null = null;
  kickvoteData: {
    restricted: string[];
    immune: string[];
    blacklist: { [id: string]: { till: string; reason: string } };
  } = {
    restricted: [],
    immune: [],
    blacklist: {},
  };
  newWhitelistId = "";
  newImmuneSecId = "";
  isLoadingSecurity = false;

  // --- Legacy V1 Archives State ---
  searchKeyControl: FormControl = new FormControl();
  selectDBControl: FormControl = new FormControl();
  restrictionMap: RestrictionMap = {};
  updateInQueue: string[] = [];
  PROFILES: Profiles = {};
  DBS: string[] = [];
  isLoadingV1 = false;

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initEditForm();
    this.loadPlayersV2();
    this.loadSecurityData();

    // Legacy DB lists
    this.adminService.getDBs("players").subscribe({
      next: (data) => {
        this.DBS = (data as string[]) || [];
        if (this.DBS.length > 0) {
          this.selectDBControl.setValue(this.DBS[0]);
        }
      },
      error: () => {},
    });
  }

  initEditForm() {
    this.editForm = this.fb.group({
      name: [""],
      warnCount: [0],
      verified: [false],
      canStartKickVote: [true],
      isKickVoteImmune: [false],
    });
  }

  // ==================== V2 SQLite Database Methods ====================

  loadPlayersV2() {
    this.isLoadingV2 = true;
    this.adminService
      .getPlayersV2(
        this.currentPageV2,
        this.perPageV2,
        this.searchQueryV2,
        this.sortByV2,
        this.sortOrderV2
      )
      .subscribe({
        next: (res) => {
          this.isLoadingV2 = false;
          if (res && res.players) {
            this.playersV2 = res.players;
            this.totalPlayersV2 = res.total || res.players.length;
          } else {
            this.playersV2 = [];
            this.totalPlayersV2 = 0;
          }
        },
        error: (err) => {
          this.isLoadingV2 = false;
          console.error("V2 Players load error:", err);
        },
      });
  }

  onSearchV2(event?: Event) {
    if (event) {
      const input = event.target as HTMLInputElement;
      this.searchQueryV2 = input.value;
    }
    this.currentPageV2 = 1;
    this.loadPlayersV2();
  }

  onSortV2(column: string) {
    if (this.sortByV2 === column) {
      this.sortOrderV2 = this.sortOrderV2 === "asc" ? "desc" : "asc";
    } else {
      this.sortByV2 = column;
      this.sortOrderV2 = "desc";
    }
    this.currentPageV2 = 1;
    this.loadPlayersV2();
  }

  onPageChangeV2(newPage: number) {
    if (newPage >= 1 && newPage <= this.getTotalPagesV2()) {
      this.currentPageV2 = newPage;
      this.loadPlayersV2();
    }
  }

  getTotalPagesV2(): number {
    return Math.ceil(this.totalPlayersV2 / this.perPageV2) || 1;
  }

  inspectPlayerV2(player: any) {
    const accountId = player.account_id || player.v2Tag || player.id;
    this.isLoadingPlayerDetails = true;
    this.selectedPlayerV2 = { ...player };

    this.adminService.getPlayerDetailsV2(accountId).subscribe({
      next: (fullDetails) => {
        this.isLoadingPlayerDetails = false;
        this.selectedPlayerV2 = { ...this.selectedPlayerV2, ...fullDetails };
        this.editForm.patchValue({
          name: this.selectedPlayerV2.name || "",
          warnCount: this.selectedPlayerV2.warnCount || 0,
          verified: !!this.selectedPlayerV2.verified,
          canStartKickVote: this.selectedPlayerV2.canStartKickVote !== false,
          isKickVoteImmune: !!this.selectedPlayerV2.isKickVoteImmune,
        });
      },
      error: () => {
        this.isLoadingPlayerDetails = false;
        this.editForm.patchValue({
          name: this.selectedPlayerV2.name || "",
          warnCount: this.selectedPlayerV2.warnCount || 0,
          verified: !!this.selectedPlayerV2.verified,
          canStartKickVote: this.selectedPlayerV2.canStartKickVote !== false,
          isKickVoteImmune: !!this.selectedPlayerV2.isKickVoteImmune,
        });
      },
    });
  }

  closePlayerModal() {
    this.selectedPlayerV2 = null;
  }

  savePlayerEdits() {
    if (!this.selectedPlayerV2) return;
    const accountId =
      this.selectedPlayerV2.account_id || this.selectedPlayerV2.v2Tag;
    this.isSavingPlayer = true;

    this.adminService
      .updatePlayerV2(accountId, this.editForm.value)
      .subscribe({
        next: () => {
          this.isSavingPlayer = false;
          this.snackBar.open("Player profile updated successfully", "OK", {
            duration: 3000,
          });
          this.inspectPlayerV2(this.selectedPlayerV2);
          this.loadPlayersV2();
        },
        error: (err) => {
          this.isSavingPlayer = false;
          this.snackBar.open(
            "Failed to update profile: " +
              (err?.error?.message || err?.message),
            "OK",
            { duration: 4000 }
          );
        },
      });
  }

  // ==================== Security Center (Whitelist / Blacklist) ====================

  loadSecurityData() {
    this.isLoadingSecurity = true;
    this.adminService.getWhitelist().subscribe({
      next: (wl) => {
        this.whitelist = wl || [];
      },
      error: () => {},
    });

    this.adminService.getKickVoteStatus().subscribe({
      next: (kv) => {
        this.kickvoteData = kv || { restricted: [], immune: [], blacklist: {} };
      },
      error: () => {},
    });

    this.adminService.getBlacklist().subscribe({
      next: (bl) => {
        this.isLoadingSecurity = false;
        this.blacklist = bl as BlacklistData;
      },
      error: () => {
        this.isLoadingSecurity = false;
      },
    });
  }

  getBannedIds(): Array<{ id: string; reason: string; till: string }> {
    if (!this.blacklist?.ban?.ids) return [];
    return Object.entries(this.blacklist.ban.ids).map(([id, info]) => ({
      id,
      reason: info?.reason || "N/A",
      till: info?.till || "Permanent",
    }));
  }

  getMutedIds(): Array<{ id: string; reason: string; till: string }> {
    if (!this.blacklist?.["muted-ids"]) return [];
    return Object.entries(this.blacklist["muted-ids"]).map(([id, info]) => ({
      id,
      reason: info?.reason || "N/A",
      till: info?.till || "Permanent",
    }));
  }

  getKickVoteDisabled(): Array<{ id: string; till: string; reason: string }> {
    const map = new Map<string, { id: string; till: string; reason: string }>();

    if (this.kickvoteData?.restricted) {
      for (const id of this.kickvoteData.restricted) {
        const info = this.kickvoteData.blacklist?.[id];
        map.set(id, {
          id,
          till: info?.till || "Permanent",
          reason: info?.reason || "Restricted via REST API",
        });
      }
    }

    if (this.blacklist?.["kick-vote-disabled"]) {
      for (const [id, info] of Object.entries(
        this.blacklist["kick-vote-disabled"]
      )) {
        if (!map.has(id)) {
          map.set(id, {
            id,
            till: info?.till || "Permanent",
            reason: (info as any)?.reason || "Restricted",
          });
        }
      }
    }

    return Array.from(map.values());
  }

  getKickVoteImmune(): string[] {
    return this.kickvoteData?.immune || [];
  }

  addImmunitySec() {
    const id = this.newImmuneSecId.trim();
    if (!id) return;
    this.adminService.grantKickVoteImmunity(id).subscribe({
      next: () => {
        this.snackBar.open(`Granted kick vote immunity to "${id}"`, "OK", {
          duration: 3000,
        });
        this.newImmuneSecId = "";
        this.loadSecurityData();
      },
      error: (err) => {
        this.snackBar.open(
          "Error granting immunity: " + (err?.error?.message || err?.message),
          "OK",
          { duration: 4000 }
        );
      },
    });
  }

  removeImmunitySec(accountId: string) {
    if (confirm(`Revoke kick vote immunity from "${accountId}"?`)) {
      this.adminService.revokeKickVoteImmunity(accountId).subscribe({
        next: () => {
          this.snackBar.open(`Revoked immunity from "${accountId}"`, "OK", {
            duration: 3000,
          });
          this.loadSecurityData();
        },
        error: (err) => {
          this.snackBar.open(
            "Error: " + (err?.error?.message || err?.message),
            "OK",
            { duration: 4000 }
          );
        },
      });
    }
  }

  addWhitelist() {
    if (!this.newWhitelistId || !this.newWhitelistId.trim()) return;
    const id = this.newWhitelistId.trim();

    this.adminService.updateWhitelist("add", id).subscribe({
      next: () => {
        this.snackBar.open(`Added "${id}" to whitelist`, "OK", {
          duration: 3000,
        });
        this.newWhitelistId = "";
        this.loadSecurityData();
      },
      error: (err) => {
        this.snackBar.open(
          "Error adding to whitelist: " + (err?.error?.message || err?.message),
          "OK",
          { duration: 4000 }
        );
      },
    });
  }

  removeWhitelist(accountId: string) {
    if (confirm(`Remove "${accountId}" from server whitelist?`)) {
      this.adminService.updateWhitelist("remove", accountId).subscribe({
        next: () => {
          this.snackBar.open(`Removed "${accountId}" from whitelist`, "OK", {
            duration: 3000,
          });
          this.loadSecurityData();
        },
        error: (err) => {
          this.snackBar.open(
            "Error: " + (err?.error?.message || err?.message),
            "OK",
            { duration: 4000 }
          );
        },
      });
    }
  }

  // ==================== Moderation Restrictions ====================

  onBanClick(account_id: string, isCurrentlyBanned: boolean = false) {
    const action = isCurrentlyBanned ? "unban" : "ban";
    this.openDialog(action, account_id, this.needDuration(action));
  }

  onUnmuteClick(account_id: string, isCurrentlyMuted: boolean = false) {
    const action = isCurrentlyMuted ? "unmute" : "mute";
    this.openDialog(action, account_id, this.needDuration(action));
  }

  onKickVoteClick(account_id: string, isCurrentlyDisabled: boolean = false) {
    const action = isCurrentlyDisabled
      ? "enable-kick-vote"
      : "disable-kick-vote";
    this.openDialog(action, account_id, this.needDuration(action));
  }

  onToggleImmunityClick(
    account_id: string,
    isCurrentlyImmune: boolean = false
  ) {
    if (!account_id) return;
    const actionText = isCurrentlyImmune ? "Revoke" : "Grant";
    if (
      !confirm(
        `${actionText} kick vote immunity for player "${account_id}"?`
      )
    ) {
      return;
    }

    const request$ = isCurrentlyImmune
      ? this.adminService.revokeKickVoteImmunity(account_id)
      : this.adminService.grantKickVoteImmunity(account_id);

    this.updateInQueue.push(account_id);
    request$.subscribe({
      next: () => {
        this.updateInQueue = this.updateInQueue.filter(
          (item) => item !== account_id
        );
        this.snackBar.open(
          `Kick vote immunity ${isCurrentlyImmune ? "revoked from" : "granted to"} ${account_id}`,
          "OK",
          { duration: 3000 }
        );
        if (
          this.selectedPlayerV2 &&
          (this.selectedPlayerV2.account_id === account_id ||
            this.selectedPlayerV2.v2Tag === account_id)
        ) {
          this.inspectPlayerV2(this.selectedPlayerV2);
        }
        this.loadPlayersV2();
        this.loadSecurityData();
      },
      error: (err) => {
        this.updateInQueue = this.updateInQueue.filter(
          (item) => item !== account_id
        );
        this.snackBar.open(
          "Action failed: " + (err?.error?.message || err?.message),
          "OK",
          { duration: 4000 }
        );
      },
    });
  }

  openDialog(
    action: string,
    account_id: string,
    requriedDuration: boolean
  ): void {
    const dialogRef = this.dialog.open(CustomDialogComponent, {
      data: { type: action, account: account_id, requriedDuration },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result || !requriedDuration) {
        this.updateInQueue.push(account_id);
        const duration = requriedDuration ? Number(result.duration) : 0;

        let request$;
        if (action === "disable-kick-vote") {
          request$ = this.adminService.restrictKickVote(
            account_id,
            duration || 30.0
          );
        } else if (action === "enable-kick-vote") {
          request$ = this.adminService.removeKickVoteRestriction(account_id);
        } else {
          request$ = this.adminService.updatePlayer(
            action,
            account_id,
            duration
          );
        }

        request$.subscribe({
            next: () => {
              this.snackBar.open(
                `Action "${action}" completed for ${account_id}`,
                "OK",
                { duration: 3000 }
              );
              this.updateInQueue = this.updateInQueue.filter(
                (item) => item !== account_id
              );
              if (
                this.selectedPlayerV2 &&
                (this.selectedPlayerV2.account_id === account_id ||
                  this.selectedPlayerV2.v2Tag === account_id)
              ) {
                this.inspectPlayerV2(this.selectedPlayerV2);
              }
              this.loadPlayersV2();
              this.loadSecurityData();
            },
            error: (err) => {
              this.updateInQueue = this.updateInQueue.filter(
                (item) => item !== account_id
              );
              this.snackBar.open(
                "Action failed: " + (err?.error?.message || err?.message),
                "OK",
                { duration: 4000 }
              );
            },
          });
      }
    });
  }

  // ==================== Legacy V1 Archive Search ====================

  onSearchV1(event: Event) {
    if (
      (event instanceof KeyboardEvent && event.key === "Enter") ||
      event instanceof FocusEvent
    ) {
      if (!this.searchKeyControl.value) return;
      this.isLoadingV1 = true;
      this.adminService
        .searchPlayer(this.searchKeyControl.value, this.selectDBControl.value)
        .subscribe({
          next: (data) => {
            this.isLoadingV1 = false;
            this.PROFILES = (data as Profiles) || {};
          },
          error: () => {
            this.isLoadingV1 = false;
          },
        });
    }
  }

  onOpenLegacy(account_id: string) {
    this.adminService.getAccountInfo(account_id).subscribe((data) => {
      this.restrictionMap[account_id] = data as AccountInfo;
    });
  }

  getRestrictionInfo(account_id: string): AccountInfo {
    return this.restrictionMap[account_id];
  }

  // ==================== Utility Methods ====================

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  needDuration(type: string) {
    return ["ban", "mute", "disable-kick-vote"].includes(type);
  }

  getDateTime(timestamp?: number) {
    if (!timestamp) return "-";
    return this.datePipe.transform(
      new Date(timestamp * 1000),
      "yyyy-MM-dd HH:mm"
    );
  }
}
