import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePerksComponent } from './manage-perks.component';

describe('ManagePerksComponent', () => {
  let component: ManagePerksComponent;
  let fixture: ComponentFixture<ManagePerksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManagePerksComponent]
    });
    fixture = TestBed.createComponent(ManagePerksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
