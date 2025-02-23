import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { HostManagerService } from 'src/app/services/host-manager.service';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  active = false;
  activeHost = '';
  serverName = '';
  constructor(
    private mainservice: MainService,
    private elementRef: ElementRef,
    private hostManager: HostManagerService
  ) {}

  ngOnInit(): void {
    this.active = false;
    this.activeHost = this.hostManager.getSelectedHost();
    this.serverName = this.hostManager.getHostDB()[this.activeHost].name;
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
