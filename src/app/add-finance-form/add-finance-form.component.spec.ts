import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFinanceFormComponent } from './add-finance-form.component';

describe('AddFinanceFormComponent', () => {
  let component: AddFinanceFormComponent;
  let fixture: ComponentFixture<AddFinanceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFinanceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFinanceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
