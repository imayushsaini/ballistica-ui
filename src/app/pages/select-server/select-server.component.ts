import { Component, inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { SavedTokens } from 'src/app/models/shared.model';
import { HostManagerService } from 'src/app/services/host-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { AddHostComponent } from 'src/app/components/add-host/add-host.component';
import { MainService } from 'src/app/services/main.service';

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
  showProxyError = false;
  readonly dialog = inject(MatDialog);
  constructor(
    private hostManager: HostManagerService,
    private _snackBar: MatSnackBar,
    private location: Location,
    private mainService: MainService
  ) {}

  ngOnInit() {
    this.serverList = this.hostManager.getHostDB();
    this.currentProxy = this.hostManager.getProxyUrl();
    this.currentHost = this.hostManager.getSelectedHost();
    this.checkProxy();
  }

  onAddNew() {
    const dialogRef = this.dialog.open(AddHostComponent, { data: 'host' });
    dialogRef.afterClosed().subscribe((result: DialogData) => {
      this.addNewHost(result);
    });
  }

  addNewHost(newHost: DialogData) {
    const host = newHost.ip + ':' + newHost.port;
    if (!newHost) return;
    this.hostManager.addNewHost(host);

    this.setServer(host);
  }

  onChangeProxy() {
    const dialogRef = this.dialog.open(AddHostComponent, { data: 'proxy' });
    dialogRef.afterClosed().subscribe((result: string) => {
      if (!result) return;
      this.currentProxy = result;
      this.hostManager.setProxyUrl(result);
      this.checkProxy();
    });
  }
  checkProxy() {
    this.mainService.pingproxy().subscribe(
      (res) => {
        this.showProxyError = false;
        this._snackBar.open('Proxy is working!', 'Alright');
      },
      (err) => {
        console.log(err);
        this.showProxyError = true;
        this._snackBar.open('Proxy is not working!', 'Alright');
      }
    );
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
