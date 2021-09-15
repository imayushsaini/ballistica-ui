import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveplayersComponent } from './liveplayers.component';

describe('LiveplayersComponent', () => {
  let component: LiveplayersComponent;
  let fixture: ComponentFixture<LiveplayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveplayersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveplayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
