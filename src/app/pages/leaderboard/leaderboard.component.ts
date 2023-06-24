import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";

import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Subject } from "rxjs";
import { LeaderboardService } from "src/app/services/leaderboard.service";
import { SubscribeService } from "src/app/services/subscribe.service";
export interface PlayerData {
  name: string;
  rank: number;
  scores: number;
  kills: number;
}

@Component({
  selector: "app-leaderboard",
  templateUrl: "./leaderboard.component.html",
  styleUrls: ["./leaderboard.component.scss"],
})
export class LeaderboardComponent implements AfterViewInit, OnInit {
  showPlayerProfile = false;
  displayedColumns: string[] = ["rank", "name", "score", "kills"];
  dataSource: MatTableDataSource<PlayerData>;
  topPlayers: PlayerData[] = [];
  @ViewChild(MatPaginator)
  paginator: MatPaginator;
  @ViewChild(MatSort)
  sort: MatSort;
  selectedPlayer: any = {};

  constructor(
    private subService: SubscribeService,
    private lBoard: LeaderboardService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource<PlayerData>();
  }
  ngOnInit() {
    this.lBoard.loadLeaderboard();
    this.getLeaderboard();
    this.lBoard.leaderboardUpdateEvent.subscribe(() => {
      this.getLeaderboard();
      this.changeDetectorRefs.detectChanges();
    });
  }
  getLeaderboard() {
    this.topPlayers = this.lBoard.getLeaderboard();
    this.dataSource.data = this.topPlayers;
    this.selectedPlayer = this.topPlayers[0];
  }
  onClose() {
    this.showPlayerProfile = false;
  }
  showProfile(row: any) {
    //only for mobile view
    this.showPlayerProfile = true;
    this.selectedPlayer = row;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
