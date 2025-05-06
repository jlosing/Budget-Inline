import { inject, Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';

import { Observable } from 'rxjs';

export interface Income {
  id?: string,
  Month: Timestamp,
  Amount: number,
}

@Injectable({
  providedIn: 'root'
})
export class IncomeTrackingService {
  private firestore = inject(Firestore);

  getIncomesOrdered(): Observable<Income[]> {
    const incomeRef = collection(this.firestore, 'income');
    const orderedQuery = query(incomeRef, orderBy('Month')); // Note: case-sensitive!
    return collectionData(orderedQuery, { idField: 'id' }) as Observable<Income[]>;
  }
}
