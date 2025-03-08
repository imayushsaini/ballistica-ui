import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { HostManagerService } from './services/host-manager.service';

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
    private location: Location
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
  }
  refresh(): void {
    this.location.go(this.location.path());
    location.reload();
  }
}
