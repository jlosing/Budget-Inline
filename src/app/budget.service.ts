import { inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';

export interface budget {
  budgetId?: string,
  uid: string,
  name: string,
  amount: number,
  categories: { [categoryName: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private firestore = inject(Firestore);

  getUserBudget(uid: string) {
    const budgetRef = collection(this.firestore, 'budget');
  }
}
