import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityRulesComponent } from './activity-rules.component';

describe('ActivityRulesComponent', () => {
  let component: ActivityRulesComponent;
  let fixture: ComponentFixture<ActivityRulesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityRulesComponent]
    });
    fixture = TestBed.createComponent(ActivityRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
