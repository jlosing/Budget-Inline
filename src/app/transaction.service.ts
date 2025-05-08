import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  Timestamp,
  query,
  where,
  orderBy,
  getDocs,
  writeBatch
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Transaction {
  id?: string;
  uid: string;
  name: string;
  amount: number;
  category: string;
  date: Timestamp | Date; 
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private firestore = inject(Firestore);
  private transactionsCollection = collection(this.firestore, 'transactions');

  addTransaction(transactionData: Omit<Transaction, 'id' | 'date'>): Promise<any> {
    const transactionWithDate = {
      ...transactionData,
      date: Timestamp.fromDate(new Date())
    };
    return addDoc(this.transactionsCollection, transactionWithDate);
  }

  getTransactionsId(uid: string): Observable<Transaction[]> {
    const userTransactionsQuery = query(
      this.transactionsCollection,
      where('uid', '==', uid),
      orderBy('date', 'desc')
    );
    return collectionData(userTransactionsQuery, { idField: 'id' }) as Observable<Transaction[]>;
  }

  async updateCategoryForTransactions(uid: string, oldCategoryName: string, newCategoryName: string): Promise<void> {
    if (oldCategoryName === newCategoryName) {
        return Promise.resolve();
    }
    const q = query(this.transactionsCollection, where('uid', '==', uid), where('category', '==', oldCategoryName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    const batch = writeBatch(this.firestore);
    querySnapshot.forEach(transactionDoc => {
      batch.update(doc(this.firestore, 'transactions', transactionDoc.id), { category: newCategoryName });
    });

    return batch.commit();
  }

  async deleteTransactionsByCategory(uid: string, categoryName: string): Promise<void> {
    const q = query(this.transactionsCollection, where('uid', '==', uid), where('category', '==', categoryName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    const batch = writeBatch(this.firestore);
    querySnapshot.forEach(transactionDoc => {
      batch.delete(doc(this.firestore, 'transactions', transactionDoc.id));
    });

    return batch.commit();
  }
}