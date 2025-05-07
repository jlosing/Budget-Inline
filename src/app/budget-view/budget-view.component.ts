import { Component, OnInit, inject } from '@angular/core';
import { Budget, BudgetService } from '../budget.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Transaction, TransactionService } from '../transaction.service';


@Component({
  selector: 'app-budget-view',
  imports: [CommonModule],
  templateUrl: './budget-view.component.html',
  styleUrl: './budget-view.component.css'
})
export class BudgetViewComponent {
  budget: Budget[] = [];

  private budgetService = inject(BudgetService);

  userBudget: Budget | null = null;
  isLoading: boolean = false;
  private budgetSubscription: Subscription | undefined;

  transactions: Transaction[] = [];

  private transactionService = inject(TransactionService);



  ngOnInit(): void {
    const staticUserId = "one"; 
    this.isLoading = true;
    this.userBudget = null; 

    console.log(`Workspaceing budget for static user ID: ${staticUserId}`);

    this.budgetSubscription = this.budgetService.getUserBudget(staticUserId).subscribe({
      next: (budget) => {
        this.userBudget = budget;
        this.isLoading = false;
        if (budget) {
          console.log(`Successfully fetched budget for UID "${staticUserId}":`, budget);
        } else {
          console.log(`No budget document found for UID "${staticUserId}".`);
        }
      },
      error: (err) => {
        console.error(`Error fetching budget for UID "${staticUserId}":`, err);
        this.userBudget = null; 
        this.isLoading = false;
      },

    });

    this.transactionService.getTransactionsId(staticUserId).subscribe((fetchedTransactions: Transaction[]) => {
      this.transactions = fetchedTransactions;
    })
  }

    ngOnDestroy(): void {
    if (this.budgetSubscription) {
      this.budgetSubscription.unsubscribe();
    }
  }
}
