import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { Location } from "@angular/common";
import { SavedTokens } from "src/app/models/shared.model";

@Component({
  selector: "app-select-server",
  templateUrl: "./select-server.component.html",
  styleUrls: ["./select-server.component.scss"],
})
export class SelectServerComponent implements OnInit {
  showNewServerDialog = false;
  serverList: SavedTokens = {};
  newApi = "";
  currentApi = "";
  constructor(
    private tokenService: TokenStorageService,
    private _snackBar: MatSnackBar,
    private location: Location
  ) {}

  ngOnInit() {
    this.serverList = this.tokenService.getTokenDict();
    this.currentApi = this.tokenService.getSelectedApi();
  }

  onAddNew() {
    this.showNewServerDialog = true;
  }
  saveNewApi() {
    if (!this.newApi) return;
    this.tokenService.addNewApi(this.newApi);
    this.refresh();
  }
  setServer(api: string) {
    this.tokenService.saveSelectedApi(api);

    this._snackBar.open(`Switched to ${api}`, "alright");
    this.refresh();
  }
  refresh(): void {
    this.location.go(this.location.path());
    location.reload();
  }
}
