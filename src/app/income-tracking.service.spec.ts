import { TestBed } from '@angular/core/testing';

import { IncomeTrackingService } from './income-tracking.service';

describe('IncomeTrackingService', () => {
  let service: IncomeTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncomeTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
