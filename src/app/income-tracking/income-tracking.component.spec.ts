import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTrackingComponent } from './income-tracking.component';

describe('IncomeTrackingComponent', () => {
  let component: IncomeTrackingComponent;
  let fixture: ComponentFixture<IncomeTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
