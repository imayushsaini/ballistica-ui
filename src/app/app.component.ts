import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TokenStorageService } from "./services/token-storage.service";
import { Location } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "ballistica-web";
  constructor(
    private route: ActivatedRoute,
    private tokenService: TokenStorageService,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const api = params["api"];
      if (api) {
        this.tokenService.addNewApi(api);
        this.tokenService.saveSelectedApi(api);
        if (api !== this.tokenService.getSelectedApi()) {
          this.refresh();
        }
      }
    });
  }
  refresh(): void {
    this.location.go(this.location.path());
    location.reload();
  }
}
