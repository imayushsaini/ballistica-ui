import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { HostManagerService } from 'src/app/services/host-manager.service';

interface ProxyStatus {
  [url: string]: { status: 'idle' | 'testing' | 'healthy' | 'error'; latency?: number; message?: string };
}

@Component({
  selector: 'app-manage-proxy-dialog',
  templateUrl: './manage-proxy-dialog.component.html',
  styleUrls: ['./manage-proxy-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class ManageProxyDialogComponent implements OnInit {
  proxyList: string[] = [];
  activeProxy = '';
  newProxyUrl = '';
  proxyStatusMap: ProxyStatus = {};
  isAddingProxy = false;

  constructor(
    public dialogRef: MatDialogRef<ManageProxyDialogComponent>,
    private hostManager: HostManagerService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.refreshList();
    this.testAllProxies();
  }

  refreshList(): void {
    this.proxyList = this.hostManager.getProxyList();
    this.activeProxy = this.hostManager.getProxyUrl();
  }

  selectProxy(url: string): void {
    this.hostManager.setActiveProxy(url);
    this.activeProxy = url;
    this.snackBar.open(`Active proxy switched to ${url}`, 'OK', { duration: 3000 });
  }

  testProxy(url: string): void {
    if (!this.proxyStatusMap[url]) {
      this.proxyStatusMap[url] = { status: 'testing' };
    } else {
      this.proxyStatusMap[url].status = 'testing';
    }

    const startTime = Date.now();
    const cleanUrl = url.replace(/\/$/, '');

    this.http.get(`${cleanUrl}/proxy-ping`, { responseType: 'text' }).subscribe({
      next: () => {
        const latency = Date.now() - startTime;
        this.proxyStatusMap[url] = { status: 'healthy', latency };
      },
      error: (err) => {
        const latency = Date.now() - startTime;
        this.proxyStatusMap[url] = {
          status: 'error',
          latency,
          message: err?.message || 'Unreachable',
        };
      },
    });
  }

  testAllProxies(): void {
    this.proxyList.forEach((url) => this.testProxy(url));
  }

  onAddProxy(): void {
    if (!this.newProxyUrl || !this.newProxyUrl.trim()) return;

    let url = this.newProxyUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    url = url.replace(/\/$/, '');

    this.hostManager.addProxy(url);
    this.newProxyUrl = '';
    this.refreshList();
    this.testProxy(url);
    this.snackBar.open(`Added proxy ${url}`, 'OK', { duration: 3000 });
  }

  onDeleteProxy(url: string, event: Event): void {
    event.stopPropagation();
    if (confirm(`Delete proxy "${url}" from saved proxy list?`)) {
      this.hostManager.deleteProxy(url);
      this.refreshList();
      this.snackBar.open(`Proxy removed`, 'OK', { duration: 3000 });
    }
  }

  close(): void {
    this.dialogRef.close(this.activeProxy);
  }
}
