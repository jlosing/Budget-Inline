import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtTrackerComponent } from './debt-tracker.component';

describe('DebtTrackerComponent', () => {
  let component: DebtTrackerComponent;
  let fixture: ComponentFixture<DebtTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
