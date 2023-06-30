import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TokenStorageService } from "./services/token-storage.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "ballistica-web";
  constructor(
    private route: ActivatedRoute,
    private tokenService: TokenStorageService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const api = params["api"];
      if (api) {
        this.tokenService.addNewApi(api);
        this.tokenService.saveSelectedApi(api);
      }
    });
  }
}
