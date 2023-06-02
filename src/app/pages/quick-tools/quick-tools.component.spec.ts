import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickToolsComponent } from './quick-tools.component';

describe('QuickToolsComponent', () => {
  let component: QuickToolsComponent;
  let fixture: ComponentFixture<QuickToolsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuickToolsComponent]
    });
    fixture = TestBed.createComponent(QuickToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
