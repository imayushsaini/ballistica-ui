/* eslint-disable no-prototype-builtins */
import { Component, OnInit } from "@angular/core";
import { AdminService } from "src/app/services/admin.service";
import { MatSnackBar } from "@angular/material/snack-bar";

interface CustomTags {
  [tagId: string]: string;
}

interface Custom {
  customtag: CustomTags;
  kick_vote_immune: string[];
}

interface Perks {
  perks: Custom;
}

@Component({
  selector: "app-manage-perks",
  templateUrl: "./manage-perks.component.html",
  styleUrls: ["./manage-perks.component.scss"],
  standalone: false,
})
export class ManagePerksComponent implements OnInit {
  CUSTOM: Custom = {
    customtag: {},
    kick_vote_immune: [],
  };
  newTagAccountId = "";
  showNewTagDialog = false;

  newImmuneAccountId = "";
  showNewImmuneDialog = false;

  isLoading = true;
  isSaving = false;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPerks();
  }

  loadPerks() {
    this.isLoading = true;
    this.adminService.getPerks().subscribe({
      next: (data) => {
        const rawPerks = (data as Perks)?.perks || (data as any) || {};
        this.CUSTOM.customtag = rawPerks.customtag || {};
        this.CUSTOM.kick_vote_immune = Array.isArray(rawPerks.kick_vote_immune)
          ? [...rawPerks.kick_vote_immune]
          : [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Perks fetch error:", err);
      },
    });
  }

  onAddNewTag() {
    this.showNewTagDialog = true;
    this.newTagAccountId = "";
  }

  onSaveTag() {
    const aid = this.newTagAccountId.trim();
    if (!aid) return;
    this.CUSTOM.customtag[aid] = "";
    this.showNewTagDialog = false;
    this.newTagAccountId = "";
  }

  onDeletePlayerTag(accountId: string) {
    if (confirm(`Remove custom tag for account "${accountId}"?`)) {
      delete this.CUSTOM.customtag[accountId];
    }
  }

  onTagUpdate(event: any, account_id: string) {
    this.CUSTOM.customtag[account_id] = event.target.value;
  }

  onAddNewImmune() {
    this.showNewImmuneDialog = true;
    this.newImmuneAccountId = "";
  }

  onSaveImmune() {
    const aid = this.newImmuneAccountId.trim();
    if (!aid) return;
    if (!this.CUSTOM.kick_vote_immune.includes(aid)) {
      this.CUSTOM.kick_vote_immune.push(aid);
    }
    this.showNewImmuneDialog = false;
    this.newImmuneAccountId = "";
  }

  onDeleteImmune(accountId: string) {
    if (confirm(`Revoke kick vote immunity for player "${accountId}"?`)) {
      this.CUSTOM.kick_vote_immune = this.CUSTOM.kick_vote_immune.filter(
        (id) => id !== accountId
      );
    }
  }

  onSubmit() {
    this.isSaving = true;
    this.adminService.updatePerks({ perks: this.CUSTOM }).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open("Custom perks and tags saved successfully", "OK", {
          duration: 3000,
        });
      },
      error: (err) => {
        this.isSaving = false;
        this.snackBar.open(
          "Failed to save perks: " + (err?.error?.message || err?.message),
          "OK",
          { duration: 4000 }
        );
      },
    });
  }
}
