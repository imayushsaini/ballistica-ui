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
})
export class NavBarComponent implements OnInit {
  active = false;
  undercommunityDomain = false;
  activeHost = '';
  serverName = '';
  constructor(
    private mainservice: MainService,
    private elementRef: ElementRef,
    private hostManager: HostManagerService,
    @Inject(DOCUMENT) private document: Document,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.active = false;
    console.log(this.document.location.hostname);
    if (this.document.location.hostname.includes('local') || 
    this.document.location.hostname.includes('community')) {
      this.undercommunityDomain = true;
    }
    this.activeHost = this.hostManager.getSelectedHost();
    this.serverName = this.hostManager.getHostDB()[this.activeHost]?.name;
    this.hostManager.onServerChange.subscribe(() => {
      this.activeHost = this.hostManager.getSelectedHost();

      this.serverName = this.hostManager.getHostDB()[this.activeHost].name;
    });
    
  }

  openDiscord() {
    window.open(this.mainservice.getDiscord());
  }

  onBurgerClicked() {
    this.active = !this.active;
  }
  onBackClick() {
    this.active = !this.active;
    this.router.navigateByUrl("https://bombsquad-community.web.app");
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
