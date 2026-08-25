/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/component-class-suffix */
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, interval } from 'rxjs';
import { LeaderboardService } from 'src/app/services/leaderboard.service';
import { MainService } from 'src/app/services/main.service';
import { SubscribeService } from 'src/app/services/subscribe.service';
import { ManageProxyDialogComponent } from 'src/app/components/manage-proxy-dialog/manage-proxy-dialog.component';

import {
  LiveData,
  TeamInfo,
  TeamPlayer,
} from 'src/app/models/live-stats.model';
import { HostManagerService } from 'src/app/services/host-manager.service';

export interface PlayerData {
  name: string;
  rank: number;
  scores: number;
  kills: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
})
export class HomeComponent implements OnInit, OnDestroy {
  playlist = { current: '', next: '' };
  teamData!: TeamInfo;
  sessionType!: string;
  topPlayers: PlayerData[] = [];
  serverName = '';
  isOffline = false;
  isProxyFailure = false;
  isLoadingStats = true;

  columns = [
    {
      columnDef: 'rank',
      header: 'No.',
      cell: (element: PlayerData) => `${element.rank}`,
    },
    {
      columnDef: 'name',
      header: 'Name',
      cell: (element: PlayerData) => `${element.name}`,
    },
    {
      columnDef: 'scores',
      header: 'Score',
      cell: (element: PlayerData) => `${element.scores}`,
    },
    {
      columnDef: 'kills',
      header: 'Kills',
      cell: (element: PlayerData) => `${element.kills}`,
    },
  ];
  dataSource = new MatTableDataSource<PlayerData>();
  private updateSubscription!: Subscription;
  public isPaused: boolean = false;
  displayedColumns = this.columns.map((c) => c.columnDef);

  constructor(
    private mainservice: MainService,
    public dialog: MatDialog,
    private subService: SubscribeService,
    private lBoard: LeaderboardService,
    public hostManager: HostManagerService,
    private changeDetectorRefs: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.serverName = this.mainservice.getServerName();
    this.lBoard.loadLeaderboard();
    this.getLeaderboard();
    this.refreshData();

    this.lBoard.leaderboardUpdateEvent.subscribe(() => {
      this.getLeaderboard();
      this.changeDetectorRefs.detectChanges();
    });

    this.mainservice.gotServerInfo.subscribe(() => {
      this.serverName = this.mainservice.getServerName();
    });

    this.hostManager.onServerChange.subscribe(() => {
      this.refreshData();
    });

    this.updateSubscription = interval(9000).subscribe(() => {
      if (!this.hostManager.getSelectedHost() || this.isPaused || this.isOffline) return;
      this.refreshData(true);
    });

    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    );
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.isPaused = true;
    } else {
      this.isPaused = false;
      if (this.isOffline) {
        this.refreshData();
      }
    }
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
        const msg = `Subscribed to ${result.name}, notification will be sent when they join.`;
        this.openSnackBar(msg, 'OK');
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, { duration: 3500 });
  }

  openProxyDialog() {
    this.dialog.open(ManageProxyDialogComponent, {
      width: '540px',
      panelClass: 'custom-dialog-container',
    });
  }

  refreshData(isBackgroundPoll = false) {
    if (!isBackgroundPoll) {
      this.isLoadingStats = true;
    }

    this.mainservice.getLiveStats().subscribe({
      next: (data: LiveData) => {
        this.isLoadingStats = false;
        this.isOffline = false;
        this.isProxyFailure = false;
        this.playlist = data.playlist || { current: '', next: '' };
        this.teamData = data.teamInfo || {};
        this.sessionType = data.sessionType || 'FreeForAll';
        if (data.name) {
          this.serverName = data.name;
        }
      },
      error: () => {
        this.isLoadingStats = false;
        this.isOffline = true;
        const currentHost = this.hostManager.getSelectedHost();

        if (!this.hostManager.isLocalIp(currentHost)) {
          // Check if proxy gateway itself is offline
          this.mainservice.pingproxy().subscribe({
            next: () => {
              this.isProxyFailure = false; // proxy is up, server is down
            },
            error: () => {
              this.isProxyFailure = true; // proxy is unreachable
            },
          });
        } else {
          this.isProxyFailure = false;
        }
      },
    });
  }

  isDualTeam(): boolean {
    if (!this.teamData) return false;
    return (
      Object.keys(this.teamData).length == 2 &&
      this.sessionType == 'DualTeamSession'
    );
  }

  getAllPlayers(): TeamPlayer[] {
    const playersList: TeamPlayer[] = [];
    if (!this.teamData) return playersList;
    for (const key in this.teamData) {
      if (!isNaN(parseInt(key))) {
        const players = this.teamData[key].players;
        if (Array.isArray(players)) {
          playersList.push(...players);
        }
      }
    }
    return playersList;
  }
}

@Component({
  selector: 'profile.dialog',
  templateUrl: './profile.dialog.html',
  standalone: false,
})
export class ProfileDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
