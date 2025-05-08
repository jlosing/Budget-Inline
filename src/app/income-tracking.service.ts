import { inject, Injectable } from '@angular/core';
import { addDoc, Timestamp } from '@angular/fire/firestore';
import { Firestore, collection, collectionData, query, orderBy, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Income {
  id?: string,
  uid: string
  Month: Timestamp,
  Amount: number,
}

@Injectable({
  providedIn: 'root'
})
export class IncomeTrackingService {
  private firestore = inject(Firestore);

  getIncomesOrdered(uid: string): Observable<Income[]> {
    console.log(`LOG: IncomeTrackingService - getIncomesOrdered called for UID: ${uid}`);
    const incomeRef = collection(this.firestore, 'income-test');
    // For diagnostics, try without orderBy first if issues persist:
    // const orderedQuery = query(incomeRef, where('uid', '==', uid));
    const orderedQuery = query(incomeRef, where('uid', '==', uid), orderBy('Month'));
    return collectionData(orderedQuery, { idField: 'id' }) as Observable<Income[]>;
  }

  async addIncome(incomeData: Omit<Income, 'id'>): Promise<void> {
    console.log('LOG: IncomeTrackingService - addIncome called with data:', JSON.parse(JSON.stringify(incomeData)));
    if (!incomeData.uid) {
      console.error('LOG: IncomeTrackingService - User ID (Uid) is required to add income.');
      throw new Error("User ID (Uid) is required to add income.");
    }
    const incomeCollection = collection(this.firestore, 'income-test');
    try {
      const docRef = await addDoc(incomeCollection, incomeData);
      console.log('LOG: IncomeTrackingService - Document written with ID:', docRef.id);
    } catch (e) {
      console.error('LOG: IncomeTrackingService - Error adding document:', e);
      throw e;
    }
  }
}