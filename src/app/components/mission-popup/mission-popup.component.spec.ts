import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionPopupComponent } from './mission-popup.component';

describe('MissionPopupComponent', () => {
  let component: MissionPopupComponent;
  let fixture: ComponentFixture<MissionPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MissionPopupComponent]
    });
    fixture = TestBed.createComponent(MissionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
