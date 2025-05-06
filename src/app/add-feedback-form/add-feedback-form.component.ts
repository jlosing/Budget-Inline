import { Component, inject } from '@angular/core';
import { Feedback, FeedbackService } from '../feedback.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-feedback-form',
  imports: [RouterLink, FormsModule],
  templateUrl: './add-feedback-form.component.html',
  styleUrl: './add-feedback-form.component.css'
})
export class AddFeedbackFormComponent {
  
  feedbackService = inject(FeedbackService);

  feedback: Feedback = {
    id: '',
    feedback: '',
    adminComment: '',
  }

  feedbackList: Feedback[] = []

  ngOnInit(): void {
    this.feedbackService.getFeedback().subscribe(data => this.feedbackList = data);
  }

  addFeedback() {
    this.feedbackService.addFeedback(this.feedback);
    this.resetForm();
  }

  resetForm() {
    this.feedback = {
      id: '',
      feedback: '',
      adminComment: '',
    }
  }
}
