import { Component, inject, OnInit } from '@angular/core';
import { Feedback, FeedbackService } from '../feedback.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-view-feedback-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './view-feedback-form.component.html',
  styleUrl: './view-feedback-form.component.css'
})
export class ViewFeedbackFormComponent implements OnInit {

  feedback: Feedback = {
    id: '',
    feedback: '',
    adminComment: '',
  }

  feedbackService = inject(FeedbackService);
  feedbackList: Feedback[] = []

  ngOnInit(): void {
    this.feedbackService.getFeedback().subscribe(data => this.feedbackList = data);
  }

  updateFeedbackList() {
    this.feedbackList.forEach(this.updateFeedback);
  }

  updateFeedback(updatedFeedback: Feedback) {
    this.feedbackService.updateFeedback(updatedFeedback);
  }

  deleteFeedback(updatedFeedback: Feedback) {
    this.feedbackService.deleteFeedback(updatedFeedback);
  }
}
