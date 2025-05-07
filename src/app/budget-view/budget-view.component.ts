import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // For @if, @for, async pipe etc.
import { Subscription, of } from 'rxjs'; // Added 'of' for default observable
import { switchMap } from 'rxjs/operators'; // For chaining observables

// Import pipes if they are standalone and used in the template
import { KeyValuePipe } from '@angular/common';
import { CurrencyPipe } from '@angular/common';

// Import the AddTransactionComponent if it's standalone and used in the template
import { AddTransactionComponent } from '../add-transaction/add-transaction.component'; // Adjust path

import { Budget, BudgetService } from '../budget.service'; // Adjust path
import { Transaction, TransactionService } from '../transaction.service'; // Adjust path
const staticUserId = "one"; // Static user ID for this component

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

  userBudget: Budget | null = null;
  transactions: Transaction[] = [];
  isLoadingBudget: boolean = false;
  isLoadingTransactions: boolean = false;

  private budgetSubscription: Subscription | undefined;
  private transactionsSubscription: Subscription | undefined;

  // Properties for "Add Transaction" modal
  showAddTransactionModal: boolean = false;
  // **** MODIFIED TYPE HERE ****
  selectedCategoryForNewTransaction: string | undefined = undefined; // Changed from string | null

  ngOnInit(): void {
    this.loadBudget();
    this.loadTransactions();
  }

  loadBudget(): void {
    this.isLoadingBudget = true;
    this.userBudget = null; // Reset before fetching

    console.log(`Fetching budget for static user ID: ${staticUserId}`);
    this.budgetSubscription = this.budgetService.getUserBudget(staticUserId).subscribe({
      next: (budget) => {
        this.userBudget = budget;
        this.isLoadingBudget = false;
        console.log(budget ? `Budget fetched: ${budget.name}` : `No budget found for UID "${staticUserId}".`);
      },
      error: (err) => {
        console.error(`Error fetching budget for UID "${staticUserId}":`, err);
        this.isLoadingBudget = false;
      }
    });
  }

  loadTransactions(): void {
    this.isLoadingTransactions = true;
    this.transactions = []; // Reset before fetching

    console.log(`Fetching transactions for static user ID: ${staticUserId}`);
    this.transactionsSubscription = this.transactionService.getTransactionsId(staticUserId).subscribe({
      next: (fetchedTransactions: Transaction[]) => {
        this.transactions = fetchedTransactions;
        this.isLoadingTransactions = false;
        console.log(`${fetchedTransactions.length} transactions fetched.`);
      },
      error: (err) => {
        console.error(`Error fetching transactions for UID "${staticUserId}":`, err);
        this.isLoadingTransactions = false;
      }
    });
  }

  /**
   * Filters transactions for a specific category.
   */
  getTransactionsForCategory(categoryKey: string): Transaction[] {
    return this.transactions.filter(t => t.category === categoryKey);
  }

  /**
   * Opens the modal to add a new transaction, pre-filling the category.
   */
  openAddTransactionModal(category: string): void {
    this.selectedCategoryForNewTransaction = category; // Assign string
    this.showAddTransactionModal = true;
    console.log(`Opening add transaction modal for category: ${category}`);
  }

  /**
   * Closes the add transaction modal.
   */
  closeAddTransactionModal(): void {
    this.showAddTransactionModal = false;
    // **** MODIFIED RESET VALUE HERE ****
    this.selectedCategoryForNewTransaction = undefined; // Reset to undefined
  }

  /**
   * Handles the event emitted when a transaction is successfully added.
   * Closes the modal and reloads the transactions.
   */
  handleTransactionAdded(): void {
    console.log('Transaction added, closing modal and reloading transactions.');
    this.closeAddTransactionModal();
    this.loadTransactions(); // Refresh the transaction list
  }

  ngOnDestroy(): void {
    if (this.budgetSubscription) {
      this.budgetSubscription.unsubscribe();
    }
    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
  }
}
