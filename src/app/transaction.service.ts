import { inject, Injectable } from '@angular/core';
import { doc, setDoc, Timestamp, where } from '@angular/fire/firestore';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


export interface Transaction {
  id?: string,
  uid: string,
  name: string,
  category: string,
  amount: number,
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private firestore = inject(Firestore);
  private transactionCollection = collection(this.firestore, 'transaction')

  getTransactionsId(uid: string): Observable<Transaction[]> {
    const transactionRef = collection(this.firestore, 'transaction');
    const orderedQuery = query(transactionRef, where('uid', '==', uid));

    return (collectionData(orderedQuery, {idField: 'id'}) as Observable<Transaction[]>);
  }

  addTransaction(newTransaction: Transaction) {
    const transactionRef = doc(this.transactionCollection);
    setDoc(transactionRef, newTransaction);
  }

  constructor() { }
}
