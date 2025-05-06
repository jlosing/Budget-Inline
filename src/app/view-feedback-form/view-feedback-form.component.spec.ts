import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFeedbackFormComponent } from './view-feedback-form.component';

describe('ViewFeedbackFormComponent', () => {
  let component: ViewFeedbackFormComponent;
  let fixture: ComponentFixture<ViewFeedbackFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFeedbackFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewFeedbackFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
