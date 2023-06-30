/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/component-class-suffix */
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource } from "@angular/material/table";
import { Subscription, interval } from "rxjs";
import { LeaderboardService } from "src/app/services/leaderboard.service";
import { MainService } from "src/app/services/main.service";
import { SubscribeService } from "src/app/services/subscribe.service";

import {
  LiveData,
  TeamInfo,
  TeamPlayer,
} from "src/app/models/live-stats.model";
export interface PlayerData {
  name: string;
  rank: number;
  scores: number;
  kills: number;
}

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, OnDestroy {
  playlist = { current: "", next: "" };
  teamData!: TeamInfo;
  sessionType!: string;
  topPlayers: PlayerData[] = [];
  serverName = "";

  columns = [
    {
      columnDef: "rank",
      header: "No.",
      cell: (element: PlayerData) => `${element.rank}`,
    },
    {
      columnDef: "name",
      header: "Name",
      cell: (element: PlayerData) => `${element.name}`,
    },
    {
      columnDef: "scores",
      header: "Score",
      cell: (element: PlayerData) => `${element.scores}`,
    },
    {
      columnDef: "kills",
      header: "Kills",
      cell: (element: PlayerData) => `${element.kills}`,
    },
  ];
  dataSource = new MatTableDataSource<PlayerData>();

  displayedColumns = this.columns.map((c) => c.columnDef);

  constructor(
    private mainservice: MainService,
    public dialog: MatDialog,
    private subService: SubscribeService,
    private lBoard: LeaderboardService,
    private changeDetectorRefs: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) {}
  private updateSubscription!: Subscription;

  ngOnInit() {
    this.serverName = this.mainservice.getServerName();
    this.lBoard.loadLeaderboard(); // maybe leaderboard not fetched yet , just call it once for safe side.
    this.getLeaderboard();
    this.refreshData();

    this.lBoard.leaderboardUpdateEvent.subscribe(() => {
      this.getLeaderboard();
      this.changeDetectorRefs.detectChanges();
    });
    this.mainservice.gotServerInfo.subscribe(() => {
      this.serverName = this.mainservice.getServerName();
    });
    this.updateSubscription = interval(9000).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) this.updateSubscription.unsubscribe();
  }

  getLeaderboard() {
    this.topPlayers = this.lBoard.getLeaderboard().slice(0, 5);
    this.dataSource.data = this.topPlayers;
  }
  openDialog(profile: any) {
    const dialogRef = this.dialog.open(ProfileDialog, {
      data: profile,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.subService.subscribeToNotifications(
          result.account_id,
          result.name
        );
        const msg = `Subscribed to ${name} , conformation notification will be sent shortely.`;
        this.openSnackBar(msg, "ok");
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  refreshData() {
    this.mainservice.getLiveStats().subscribe((data: LiveData) => {
      this.playlist = data.playlist;
      this.teamData = data.teamInfo;
      this.sessionType = data.sessionType;
    });
  }

  isDualTeam(): boolean {
    if (!this.teamData) return false;
    return (
      Object.keys(this.teamData).length == 2 &&
      this.sessionType == "DualTeamSession"
    );
  }
  getAllPlayers(): TeamPlayer[] {
    const playersList = [];
    for (const key in this.teamData) {
      if (!isNaN(parseInt(key))) {
        const players = this.teamData[key].players;
        playersList.push(...players);
      }
    }
    return playersList;
  }
}
@Component({
  selector: "profile.dialog",
  templateUrl: "./profile.dialog.html",
})
export class ProfileDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
