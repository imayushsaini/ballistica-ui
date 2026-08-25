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
import { LeaderboardService } from "src/app/services/leaderboard.service";
import { SubscribeService } from "src/app/services/subscribe.service";

export interface PlayerData {
  id?: string;
  name: string;
  rank: number;
  scores: number;
  kills: number;
  deaths?: number;
  last_seen?: string;
}

@Component({
  selector: "app-leaderboard",
  templateUrl: "./leaderboard.component.html",
  styleUrls: ["./leaderboard.component.scss"],
  standalone: false,
})
export class LeaderboardComponent implements AfterViewInit, OnInit {
  showPlayerProfile = false;
  displayedColumns: string[] = ["rank", "name", "score", "kills", "kd"];
  dataSource: MatTableDataSource<PlayerData>;
  topPlayers: PlayerData[] = [];
  selectedPlayer: any = null;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private subService: SubscribeService,
    private lBoard: LeaderboardService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {
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
    if (this.topPlayers.length > 0 && !this.selectedPlayer) {
      this.selectedPlayer = this.topPlayers[0];
    }
  }

  selectPlayer(player: any) {
    this.selectedPlayer = player;
    this.showPlayerProfile = true;
  }

  onClose() {
    this.showPlayerProfile = false;
  }

  getKD(kills?: number, deaths?: number): string {
    const k = kills || 0;
    const d = deaths || 0;
    if (d === 0) return k > 0 ? k.toFixed(2) : "0.00";
    return (k / d).toFixed(2);
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
