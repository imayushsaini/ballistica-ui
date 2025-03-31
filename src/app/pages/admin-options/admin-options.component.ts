import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HostManagerService } from 'src/app/services/host-manager.service';

@Component({
  selector: 'app-admin-options',
  templateUrl: './admin-options.component.html',
  styleUrls: ['./admin-options.component.scss'],
})
export class AdminOptionsComponent implements OnInit {
  constructor(
    private router: Router,
    private hostManager: HostManagerService
  ) {}

  ngOnInit() {
    const isLoggedIn = !!this.hostManager.getToken();
    if (isLoggedIn) {
      this.router.navigate(['/', 'admin']);
    }
  }
}
