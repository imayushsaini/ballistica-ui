import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HostManagerService } from 'src/app/services/host-manager.service';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  standalone: false,
})
export class NavBarComponent implements OnInit {
  active = false;
  undercommunityDomain = false;
  activeHost = '';
  serverName = '';
  isLoggedIn = false;

  constructor(
    private mainservice: MainService,
    private elementRef: ElementRef,
    private hostManager: HostManagerService,
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.active = false;
    if (
      this.document.location.hostname.includes('local') ||
      this.document.location.hostname.includes('community')
    ) {
      this.undercommunityDomain = true;
    }
    this.updateState();

    this.hostManager.onServerChange.subscribe(() => {
      this.updateState();
    });

    this.hostManager.onAuthChange.subscribe((auth) => {
      this.isLoggedIn = auth;
    });

    this.mainservice.gotServerInfo.subscribe(() => {
      this.serverName = this.mainservice.getServerName();
    });
  }

  updateState() {
    this.activeHost = this.hostManager.getSelectedHost();
    this.isLoggedIn = this.hostManager.isAuthenticated(this.activeHost);
    const hostInfo = this.hostManager.getHostDB()[this.activeHost];
    this.serverName = hostInfo?.name || this.mainservice.getServerName() || '';
  }

  openDiscord() {
    window.open(this.mainservice.getDiscord());
  }

  onBurgerClicked() {
    this.active = !this.active;
  }

  closeMenu() {
    this.active = false;
  }

  onBackClick() {
    this.active = !this.active;
    this.router.navigateByUrl('https://bombsquad-community.web.app');
  }

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement): void {
    if (!targetElement) {
      return;
    }
    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      if (this.active) {
        this.active = false;
      }
    }
  }
}
