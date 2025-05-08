import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  limit,
  query,
  where,
  updateDoc,
  doc,
  deleteField
} from '@angular/fire/firestore';
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
          return budgets[0];
        }
        else return null;
  })
    );
  }

  addCategoryToBudget(budgetId: string, categoryName: string, amount: number): Promise<void> {
    const budgetDocRef = doc(this.firestore, 'budget', budgetId);
    return updateDoc(budgetDocRef, {
      [`categories.${categoryName}`]: amount
    });
  }

  async editCategoryName(budgetId: string, oldCategoryName: string, newCategoryName: string, categoryAmount: number): Promise<void> {
    if (oldCategoryName === newCategoryName) {
      const budgetDocRef = doc(this.firestore, 'budget', budgetId);
      return updateDoc(budgetDocRef, { // Still update amount if name is same
        [`categories.${newCategoryName}`]: categoryAmount
      });
    }
    const budgetDocRef = doc(this.firestore, 'budget', budgetId);
    const updates: { [key: string]: any } = {};
    updates[`categories.${newCategoryName}`] = categoryAmount;
    updates[`categories.${oldCategoryName}`] = deleteField();

    return updateDoc(budgetDocRef, updates);
  }

  deleteCategory(budgetId: string, categoryName: string): Promise<void> {
    const budgetDocRef = doc(this.firestore, 'budget', budgetId);
    return updateDoc(budgetDocRef, {
      [`categories.${categoryName}`]: deleteField()
    });
  }
}