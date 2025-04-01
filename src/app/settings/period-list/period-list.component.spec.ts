import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodListComponent } from './period-list.component';

describe('PeriodListComponent', () => {
  let component: PeriodListComponent;
  let fixture: ComponentFixture<PeriodListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PeriodListComponent]
    });
    fixture = TestBed.createComponent(PeriodListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
