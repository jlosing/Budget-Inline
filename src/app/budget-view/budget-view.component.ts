import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { KeyValuePipe } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { Budget, BudgetService } from '../budget.service';
import { Transaction, TransactionService } from '../transaction.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-budget-view',
  standalone: true,
  imports: [
    CommonModule,
    KeyValuePipe,
    CurrencyPipe,
    AddTransactionComponent,
  ],
  templateUrl: './budget-view.component.html',
  styleUrls: ['./budget-view.component.css']
})
export class BudgetViewComponent implements OnInit, OnDestroy {
  private budgetService = inject(BudgetService);
  private transactionService = inject(TransactionService);
  private userService = inject(UserService);

  userBudget: Budget | null = null;
  transactions: Transaction[] = [];
  isLoadingBudget: boolean = false;
  isLoadingTransactions: boolean = false;

  private budgetSubscription: Subscription | undefined;
  private transactionsSubscription: Subscription | undefined;
  private userSubscription: Subscription | undefined;

  showAddTransactionModal: boolean = false;
  selectedCategoryForNewTransaction: string | undefined = undefined;

  userId: string | null = null;

  ngOnInit(): void {
    this.userSubscription = this.userService.user$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        console.log('Authenticated User ID obtained:', this.userId);
        this.loadBudget();
        this.loadTransactions();
      } else {
        this.userId = null;
        console.log('No user is currently logged in.');
        this.userBudget = null;
        this.transactions = [];
        this.isLoadingBudget = false;
        this.isLoadingTransactions = false;
      }
    });
  }

  loadBudget(): void {
    if (!this.userId) {
      console.log('No user ID available, cannot load budget.');
      this.userBudget = null;
      this.isLoadingBudget = false;
      return;
    }

    this.isLoadingBudget = true;
    this.userBudget = null;

    console.log(`Fetching budget for user ID: ${this.userId}`);
    this.budgetSubscription = this.budgetService.getUserBudget(this.userId).subscribe({
      next: (budget) => {
        this.userBudget = budget;
        this.isLoadingBudget = false;
        console.log(budget ? `Budget fetched: ${budget.name}` : `No budget found for UID "${this.userId}".`);
      },
      error: (err) => {
        console.error(`Error fetching budget for UID "${this.userId}":`, err);
        this.isLoadingBudget = false;
      }
    });
  }


  loadTransactions(): void {
     if (!this.userId) {
      console.log('No user ID available, cannot load transactions.');
      this.transactions = [];
      this.isLoadingTransactions = false;
      return;
    }

    this.isLoadingTransactions = true;
    this.transactions = [];

    console.log(`Fetching transactions for user ID: ${this.userId}`);
    this.transactionsSubscription = this.transactionService.getTransactionsId(this.userId).subscribe({
      next: (fetchedTransactions: Transaction[]) => {
        this.transactions = fetchedTransactions;
        this.isLoadingTransactions = false;
        console.log(`${fetchedTransactions.length} transactions fetched.`);
      },
      error: (err) => {
        console.error(`Error fetching transactions for UID "${this.userId}":`, err);
        this.isLoadingTransactions = false;
      }
    });
  }

  getTransactionsForCategory(categoryKey: string): Transaction[] {
    return this.transactions.filter(t => t.category === categoryKey);
  }

  openAddTransactionModal(category: string): void {
    this.selectedCategoryForNewTransaction = category;
    this.showAddTransactionModal = true;
    console.log(`Opening add transaction modal for category: ${category}`);
    // Assuming AddTransactionComponent has an input like @Input() userId: string | undefined;
    // You would pass it here, likely when creating or interacting with the modal instance
    // Example (replace with your actual modal implementation logic):
    // this.addTransactionComponentRef.userId = this.userId ?? undefined;
  }

  closeAddTransactionModal(): void {
    this.showAddTransactionModal = false;
    this.selectedCategoryForNewTransaction = undefined;
  }

  handleTransactionAdded(): void {
    console.log('Transaction added, closing modal and reloading transactions.');
    this.closeAddTransactionModal();
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    if (this.budgetSubscription) {
      this.budgetSubscription.unsubscribe();
    }
    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
