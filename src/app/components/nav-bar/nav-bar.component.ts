import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { MainService } from 'src/app/services/main.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {

  active = false;

  constructor(private mainservice: MainService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.active = false;
  }

  openDiscord() {
    this.mainservice.getDiscord().subscribe((data) => {
      console.log(data);
      console.log(data['url']);
      window.open(data['url']);
    });
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
              this.active = false
            }
        }
    }
}
