import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleTableComponent } from './schedule-table.component';

describe('ScheduleTableComponent', () => {
  let component: ScheduleTableComponent;
  let fixture: ComponentFixture<ScheduleTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleTableComponent]
    });
    fixture = TestBed.createComponent(ScheduleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
