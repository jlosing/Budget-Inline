import { inject, Injectable } from '@angular/core';
import { Firestore, 
  collection, 
  collectionData, 
  limit, 
  query, 
  where } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

export interface Budget {
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

  getUserBudget(uid: string): Observable<Budget | null> {
    const budgetRef = collection(this.firestore, 'budget');
    const budgetQuery = query(
      budgetRef, 
      where('uid', '==', uid),
      limit(1),
    );

    return (collectionData(budgetQuery, { idField: 'budgetId'}) as Observable<Budget[]>).pipe(
      map(budgets => {
      if (budgets.length > 0) {
          console.log(`Budget found for user ${uid}:`, budgets[0]);
          return budgets[0];
        }
        else return null;
  })
    );
  }
}
