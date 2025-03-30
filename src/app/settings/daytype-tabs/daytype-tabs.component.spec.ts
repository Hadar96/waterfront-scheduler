import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaytypeTabsComponent } from './daytype-tabs.component';

describe('DaytypeTabsComponent', () => {
  let component: DaytypeTabsComponent;
  let fixture: ComponentFixture<DaytypeTabsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DaytypeTabsComponent]
    });
    fixture = TestBed.createComponent(DaytypeTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
