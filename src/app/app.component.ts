import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { HostManagerService } from './services/host-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { WelcomeDialogComponent } from './components/welcome-dialog/welcome-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'server-manager';
  constructor(
    private route: ActivatedRoute,
    private hostManager: HostManagerService,
    private location: Location,
    private dialog: MatDialog,
     private router: Router 
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const host = params['host'];
      if (host) {
        this.hostManager.addNewHost(host);
        if (host !== this.hostManager.getSelectedHost()) {
          this.hostManager.switchHost(host);
          this.refresh();
        }
      }
    });
    // if host is default , show dialog to add new server
    if (this.hostManager.getSelectedHost() === '127.0.0.1:43210') {
       const dialogRef = this.dialog.open(
        WelcomeDialogComponent
      );
      dialogRef.afterClosed().subscribe((result) => {
        //route to switch server page
       this.router.navigate(['/switch-server']);
      });

    }
  }
  refresh(): void {
    this.location.go(this.location.path());
    location.reload();
  }
}
