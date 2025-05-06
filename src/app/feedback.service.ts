import { inject, Injectable } from '@angular/core';
import { collection, collectionData, deleteDoc, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


export interface Feedback {
  id: string,
  feedback: string,
  adminComment: string,
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor() { }

  private firestore = inject(Firestore);
  private feedbackCollection = collection(this.firestore, 'feedback');

  getFeedback(): Observable<Feedback[]> {
    return collectionData(this.feedbackCollection, ({idField: 'id'})) as Observable<Feedback[]>;
  }

  addFeedback(newFeedback: Feedback) {
    const feedbackRef = doc(this.feedbackCollection);
    newFeedback.id = feedbackRef.id;
    setDoc(feedbackRef, newFeedback);
  }

  updateFeedback(feedback: Feedback) {
    const feedbackRef = doc(this.firestore, `feedback/${feedback.id}`);
    updateDoc(feedbackRef,{...feedback});
  }

  deleteFeedback(id: string) {
    const feedbackRef = doc(this.firestore, `feedback/${id}`);
    deleteDoc(feedbackRef);
  }

}
