/* eslint-disable no-prototype-builtins */
import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { AdminService } from "src/app/services/admin.service";
import { COMMA, ENTER } from "@angular/cdk/keycodes";

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
  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getPerks().subscribe((data) => {
      this.CUSTOM = (data as Perks)["perks"];
      this.availableEffects = (data as Perks)["availableEffects"];
      this.isLoading = false;
      this.updateEffectControls();
    });
  }
  updateEffectControls() {
    for (const player in this.CUSTOM["customeffects"]) {
      const effectControl = new FormControl("");
      const filteredEffects = effectControl.valueChanges.pipe(
        startWith(null),
        map((effect: string | null) =>
          effect ? this._filter(effect) : this.availableEffects.slice()
        )
      );
      this.accountEffectControlMap[player] = {
        ctrl: effectControl,
        filter: filteredEffects,
      };
    }
  }
  onAddNew(type: string) {
    if (type === "effect") this.showNewEffectDialog = true;
    else if (type === "tag") this.showNewTagDialog = true;
  }
  onSaveId(type: string) {
    if (type === "effect") {
      this.CUSTOM["customeffects"][this.newEffectAccountId] = [];
      this.updateEffectControls();
      this.showNewEffectDialog = false;
    } else if (type == "tag") {
      this.CUSTOM["customtag"][this.newTagAccountId] = "";
      this.showNewTagDialog = false;
    }
  }

  add(event: MatChipInputEvent, account_id: string): void {
    const value = (event.value || "").trim();

    // Add our effect
    if (value) {
      this.CUSTOM["customeffects"][account_id].push(value);
    }

    // Clear the input value
    event.chipInput?.clear();
    this.accountEffectControlMap[account_id].ctrl.setValue(null);
  }

  remove(effect: string, account_id: string): void {
    const index = this.CUSTOM["customeffects"][account_id].indexOf(effect);

    if (index >= 0) {
      this.CUSTOM["customeffects"][account_id].splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent, account_id: string): void {
    this.CUSTOM["customeffects"][account_id].push(event.option.viewValue);

    this.accountEffectControlMap[account_id].ctrl.setValue(null);
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
  onSubmt() {
    this.adminService.updatePerks(this.CUSTOM).subscribe((data) => {
      console.log(data);
    });
  }
}
