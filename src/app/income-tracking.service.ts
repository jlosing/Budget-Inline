import { inject, Injectable } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { Firestore, collection, collectionData, query, orderBy, where } from '@angular/fire/firestore';

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

  getIncomesOrdered(uid: string): Observable<Income[]> {
    const incomeRef = collection(this.firestore, 'income-test');
    const orderedQuery = query(incomeRef, where('uid', '==', uid), orderBy('Month')); 
    return collectionData(orderedQuery, { idField: 'id' }) as Observable<Income[]>;
  }
}
