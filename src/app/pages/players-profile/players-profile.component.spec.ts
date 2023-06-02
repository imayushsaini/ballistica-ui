import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersProfileComponent } from './players-profile.component';

describe('PlayersProfileComponent', () => {
  let component: PlayersProfileComponent;
  let fixture: ComponentFixture<PlayersProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayersProfileComponent]
    });
    fixture = TestBed.createComponent(PlayersProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
