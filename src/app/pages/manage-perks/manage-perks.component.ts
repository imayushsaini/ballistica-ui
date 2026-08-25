/* eslint-disable no-prototype-builtins */
import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { AdminService } from "src/app/services/admin.service";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatChipInputEvent } from "@angular/material/chips";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

interface CustomEffects {
  [accountId: string]: string[];
}

interface CustomTags {
  [tagId: string]: string;
}

interface Custom {
  customeffects: CustomEffects;
  customtag: CustomTags;
}

interface Perks {
  availableEffects: string[];
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
    customeffects: {},
    customtag: {},
  };
  accountEffectControlMap: {
    [key: string]: { ctrl: FormControl; filter: Observable<string[]> };
  } = {};
  accountTagControlMap: { [key: string]: FormControl } = {};
  separatorKeysCodes: number[] = [ENTER, COMMA];
  newEffectAccountId = "";
  newTagAccountId = "";

  availableEffects: string[] = [];
  showNewEffectDialog = false;
  showNewTagDialog = false;
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
        this.CUSTOM = (data as Perks)["perks"] || { customeffects: {}, customtag: {} };
        this.availableEffects = (data as Perks)["availableEffects"] || [];
        this.isLoading = false;
        this.updateEffectControls();
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Perks fetch error:", err);
      },
    });
  }

  updateEffectControls() {
    for (const player in this.CUSTOM["customeffects"]) {
      this.getAccountEffectControl(player);
    }
  }

  getAccountEffectControl(accountKey: string): FormControl {
    if (!this.accountEffectControlMap[accountKey]) {
      const effectControl = new FormControl("");
      const filteredEffects = effectControl.valueChanges.pipe(
        startWith(null),
        map((effect: string | null) =>
          effect ? this._filter(effect) : this.availableEffects.slice()
        )
      );
      this.accountEffectControlMap[accountKey] = {
        ctrl: effectControl,
        filter: filteredEffects,
      };
    }
    return this.accountEffectControlMap[accountKey].ctrl;
  }

  onAddNew(type: string) {
    if (type === "effect") {
      this.showNewEffectDialog = true;
      this.newEffectAccountId = "";
    } else if (type === "tag") {
      this.showNewTagDialog = true;
      this.newTagAccountId = "";
    }
  }

  onSaveId(type: string) {
    if (type === "effect") {
      if (!this.newEffectAccountId.trim()) return;
      this.CUSTOM["customeffects"][this.newEffectAccountId.trim()] = [];
      this.updateEffectControls();
      this.showNewEffectDialog = false;
    } else if (type === "tag") {
      if (!this.newTagAccountId.trim()) return;
      this.CUSTOM["customtag"][this.newTagAccountId.trim()] = "";
      this.showNewTagDialog = false;
    }
  }

  onDeletePlayerEffect(accountId: string) {
    if (confirm(`Remove custom effects for account "${accountId}"?`)) {
      delete this.CUSTOM["customeffects"][accountId];
      delete this.accountEffectControlMap[accountId];
    }
  }

  onDeletePlayerTag(accountId: string) {
    if (confirm(`Remove custom tag for account "${accountId}"?`)) {
      delete this.CUSTOM["customtag"][accountId];
    }
  }

  add(event: MatChipInputEvent, account_id: string): void {
    const value = (event.value || "").trim();
    if (value && !this.CUSTOM["customeffects"][account_id].includes(value)) {
      this.CUSTOM["customeffects"][account_id].push(value);
    }
    event.chipInput?.clear();
    if (this.accountEffectControlMap[account_id]) {
      this.accountEffectControlMap[account_id].ctrl.setValue(null);
    }
  }

  remove(effect: string, account_id: string): void {
    const index = this.CUSTOM["customeffects"][account_id].indexOf(effect);
    if (index >= 0) {
      this.CUSTOM["customeffects"][account_id].splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent, account_id: string): void {
    const value = event.option.viewValue;
    if (!this.CUSTOM["customeffects"][account_id].includes(value)) {
      this.CUSTOM["customeffects"][account_id].push(value);
    }
    if (this.accountEffectControlMap[account_id]) {
      this.accountEffectControlMap[account_id].ctrl.setValue(null);
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableEffects.filter((effect) =>
      effect.toLowerCase().includes(filterValue)
    );
  }

  onTagUpdate(event: any, account_id: string) {
    this.CUSTOM.customtag[account_id] = event.target.value;
  }

  onSubmit() {
    this.isSaving = true;
    this.adminService.updatePerks(this.CUSTOM).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open("Custom perks and effects saved successfully", "OK", {
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
