import { Component, inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SavedTokens } from 'src/app/models/shared.model';
import { HostManagerService } from 'src/app/services/host-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { AddHostComponent } from 'src/app/components/add-host/add-host.component';
import { ManageProxyDialogComponent } from 'src/app/components/manage-proxy-dialog/manage-proxy-dialog.component';

export interface DialogData {
  ip: string;
  port: string;
}

@Component({
  selector: 'app-select-server',
  templateUrl: './select-server.component.html',
  styleUrls: ['./select-server.component.scss'],
  standalone: false,
})
export class SelectServerComponent implements OnInit {
  serverList: SavedTokens = {};
  currentHost = '';
  readonly dialog = inject(MatDialog);

  constructor(
    public hostManager: HostManagerService,
    private _snackBar: MatSnackBar,
    private location: Location,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.serverList = this.hostManager.getHostDB();
    this.currentHost = this.hostManager.getSelectedHost();

    this.route.queryParams.subscribe((params) => {
      if (params['openProxy'] === 'true') {
        this.onOpenProxyManager();
      }
    });
  }

  isLocalIp(host: string): boolean {
    return this.hostManager.isLocalIp(host);
  }

  onAddNew() {
    const dialogRef = this.dialog.open(AddHostComponent, { data: 'host' });
    dialogRef.afterClosed().subscribe((result: DialogData) => {
      if (result && result.ip && result.port) {
        this.addNewHost(result);
      }
    });
  }

  addNewHost(newHost: DialogData) {
    const host = newHost.ip + ':' + newHost.port;
    this.hostManager.addNewHost(host);
    this.serverList = this.hostManager.getHostDB();
    this.setServer(host);
  }

  onDeleteServer(host: string, event: Event): void {
    event.stopPropagation();
    if (confirm(`Remove "${host}" from your saved server list?`)) {
      this.hostManager.deleteHost(host);
      this.serverList = this.hostManager.getHostDB();
      this._snackBar.open(`Removed ${host}`, 'OK', { duration: 3000 });
      if (this.currentHost === host) {
        const remaining = Object.keys(this.serverList);
        if (remaining.length > 0) {
          this.setServer(remaining[0]);
        }
      }
    }
  }

  onOpenProxyManager() {
    this.dialog.open(ManageProxyDialogComponent, {
      width: '540px',
      panelClass: 'custom-dialog-container',
    });
  }

  setServer(host: string) {
    this.hostManager.switchHost(host);
    this._snackBar.open(`Switched active server to ${host}`, 'OK', { duration: 3000 });
    this.refresh();
  }

  refresh(): void {
    this.location.go(this.location.path());
    location.reload();
  }
}
