import { inject, Injectable } from '@angular/core';
import { collection, collectionData, deleteDoc, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Finance {
  id: string,
  user_id: string,
  name: string,
  amount: number,
  source?: string,
  description?: string,
  isIncome: boolean, //For debt set to false
  balance: number,
  isReoccuring: boolean, //If false, everything below here should be null
  interestRate?: number,
  interestFrequency?: number, //Frequency in days
  interestEndDate?: string,
  income?: number,
  incomeFrequency?: number, //Frequency in days
  incomeEndDate?: string,
  expense?: number,
  expenseFrequency?: number, //Frequency in days
  expenseEndDate?: string,
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {

  constructor() { }

  private firestore = inject(Firestore);
  private financesCollection = collection(this.firestore, 'finances');

  getFinances(): Observable<Finance[]> {
    return collectionData(this.financesCollection, ({idField: 'id'})) as Observable<Finance[]>;
  }

  addFinance(newFinance: Finance) {
    const financeRef = doc(this.financesCollection);
    newFinance.id = financeRef.id;
    setDoc(financeRef, newFinance);
  }

  updateFinance(finance: Finance) {
    const financeRef = doc(this.firestore, `finances/${finance.id}`);
    updateDoc(financeRef,{...finance});
  }

  deleteFinance(id: string) {
    const financeRef = doc(this.firestore, `finances/${id}`);
    deleteDoc(financeRef);
  }

}
