import { Component, OnInit } from "@angular/core";
import { LeaderboardService } from "./services/leaderboard.service";
import { MainService } from "./services/main.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "ballistica-web";
  constructor(
    private lBoard: LeaderboardService,
    private mainService: MainService
  ) {}
  ngOnInit() {
    this.lBoard.loadLeaderboard();
  }
}
