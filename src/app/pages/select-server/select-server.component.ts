import { Component, inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { SavedTokens } from 'src/app/models/shared.model';
import { HostManagerService } from 'src/app/services/host-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { AddHostComponent } from 'src/app/components/add-host/add-host.component';

export interface DialogData {
  ip: string;
  port: string;
}

@Component({
  selector: 'app-select-server',
  templateUrl: './select-server.component.html',
  styleUrls: ['./select-server.component.scss'],
})
export class SelectServerComponent implements OnInit {
  showNewServerDialog = false;
  serverList: SavedTokens = {};
  currentProxy = '';
  currentHost = '';
  readonly dialog = inject(MatDialog);
  constructor(
    private hostManager: HostManagerService,
    private _snackBar: MatSnackBar,
    private location: Location
  ) {}

  ngOnInit() {
    this.serverList = this.hostManager.getHostDB();
    this.currentProxy = this.hostManager.getProxyUrl();
    this.currentHost = this.hostManager.getSelectedHost();
  }

  onAddNew() {
    const dialogRef = this.dialog.open(AddHostComponent, { data: 'host' });
    dialogRef.afterClosed().subscribe((result: DialogData) => {
      this.addNewHost(result);
    });
  }

  addNewHost(newHost: DialogData) {
    if (!newHost) return;
    this.hostManager.addNewHost(newHost.ip + ':' + newHost.port);

    this.refresh();
  }

  onChangeProxy() {
    const dialogRef = this.dialog.open(AddHostComponent, { data: 'proxy' });
    dialogRef.afterClosed().subscribe((result: string) => {
      if (!result) return;
      this.currentProxy = result;
      this.hostManager.setProxyUrl(result);
    });
  }

  setServer(host: string) {
    this.hostManager.switchHost(host);
    this._snackBar.open(`Switched to ${host}`, 'alright');
    this.refresh();
  }

  refresh(): void {
    this.location.go(this.location.path());
    location.reload();
  }
}
