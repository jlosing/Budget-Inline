import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { Budget, BudgetService } from '../budget.service';
import { Transaction, TransactionService } from '../transaction.service';
import { UserService } from '../user.service';
import { Timestamp } from '@angular/fire/firestore';


type BudgetOmitData = Omit<Budget, 'budgetId' | 'categories'>;

@Component({
  selector: 'app-budget-view',
  standalone: true,
  imports: [
    CommonModule,
    AddTransactionComponent,
    FormsModule,
  ],
  templateUrl: './budget-view.component.html',
  styleUrls: ['./budget-view.component.css']
})
export class BudgetViewComponent implements OnInit, OnDestroy {
  private budgetService = inject(BudgetService);
  private transactionService = inject(TransactionService);
  private userService = inject(UserService);

  displayAddCategory = false;
  displayAddBudget = false;


  transactions: Transaction[] = [];
  isLoadingBudget: boolean = false;
  isLoadingTransactions: boolean = false;

  categoryName: string | null = null;
  categoryAmount: number | null = null;


  private budgetSubscription: Subscription | undefined;
  private transactionsSubscription: Subscription | undefined;
  private userSubscription: Subscription | undefined;

  showAddTransactionModal: boolean = false;
  selectedCategoryForNewTransaction: string | undefined = undefined;

  userId: string | null = null;

  newBudgetName: string | null = null;
  newBudgetAmount: number | null = null;
  newBudgetCategories: { [categoryName: string]: number } | null = null;
  newBudgetUid: string | null = this.userId;

  userBudget: Budget | null = null;
  
  userAddBudget: BudgetOmitData = {
   uid: '',
   name: '',
   amount: 0,
  };

  showEditCategoryModal: boolean = false;
  editingCategory: { oldName: string, oldAmount: number } | null = null;
  newCategoryNameInput: string = '';
  newCategoryAmountInput: number | null = null;

  ngOnInit(): void {
    this.userSubscription = this.userService.user$.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadBudget();
        this.loadTransactions();
      } else {
        this.userId = null;
        this.userBudget = null;
        this.transactions = [];
        this.isLoadingBudget = false;
        this.isLoadingTransactions = false;
      }
    });
  }

  loadBudget(): void {
    if (!this.userId) {
      this.userBudget = null;
      this.isLoadingBudget = false;
      return;
    }
    this.isLoadingBudget = true;
    this.budgetSubscription = this.budgetService.getUserBudget(this.userId).subscribe({
      next: (budget) => {
        this.userBudget = budget;
        this.isLoadingBudget = false;
      },
      error: (err) => {
        console.error(`Error fetching budget for UID "${this.userId}":`, err);
        this.isLoadingBudget = false;
      }
    });
  }

  loadTransactions(): void {
  if (!this.userId) {
    this.transactions = [];
    this.isLoadingTransactions = false;
    return;
  }
  this.isLoadingTransactions = true;
  this.transactionsSubscription = this.transactionService.getTransactionsId(this.userId).subscribe({
    next: () => {
      this.isLoadingTransactions = false;
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
  }

  closeAddTransactionModal(): void {
    this.showAddTransactionModal = false;
    this.selectedCategoryForNewTransaction = undefined;
  }

  handleTransactionAdded(): void {
    this.closeAddTransactionModal();
    this.loadTransactions();
  }

  addCategoryClick() {
    this.displayAddCategory = !this.displayAddCategory;
    if (this.displayAddCategory) {
        this.categoryName = '';
        this.categoryAmount = null;
    }
  }

  async onClickAdd() {
    if (this.categoryName && this.categoryAmount != null && this.userBudget?.budgetId && this.userId) {
      try {
        await this.budgetService.addCategoryToBudget(this.userBudget.budgetId, this.categoryName, this.categoryAmount);
        this.categoryAmount = null;
        this.categoryName = '';
        this.loadBudget();
      } catch (error) {
        console.error("Error adding category to budget:", error);
      }
    } else {
      console.log("Error adding budget: Invalid data or budget ID missing.");
    }
    this.addCategoryClick();
  }

  openEditCategoryModal(oldName: string, oldAmount: number): void {
    this.editingCategory = { oldName, oldAmount };
    this.newCategoryNameInput = oldName;
    this.newCategoryAmountInput = oldAmount;
    this.showEditCategoryModal = true;
  }

  closeEditCategoryModal(): void {
    this.showEditCategoryModal = false;
    this.editingCategory = null;
    this.newCategoryNameInput = '';
    this.newCategoryAmountInput = null;
  }

  async submitEditCategory(): Promise<void> {
    if (!this.editingCategory || !this.userBudget?.budgetId || !this.userId || !this.newCategoryNameInput.trim() || this.newCategoryAmountInput == null) {
      console.error("Cannot edit category: required information is missing.");
      return;
    }

    const { oldName } = this.editingCategory;
    const newName = this.newCategoryNameInput.trim();
    const newAmount = this.newCategoryAmountInput;

    if (newName.length === 0 || newAmount < 0) {
        alert("New category name cannot be empty and amount cannot be negative.");
        return;
    }

    if (oldName !== newName && this.userBudget.categories.hasOwnProperty(newName)) {
        alert(`Category "${newName}" already exists. Please choose a different name.`);
        return;
    }

    try {
      await this.budgetService.editCategoryName(this.userBudget.budgetId, oldName, newName, newAmount);

      if (oldName !== newName) {
        await this.transactionService.updateCategoryForTransactions(this.userId, oldName, newName);
      }

      this.loadBudget();
      this.loadTransactions();
      this.closeEditCategoryModal();
    } catch (error) {
      console.error("Error editing category:", error);
    }
  }

  async confirmDeleteCategory(categoryName: string): Promise<void> {
    if (!this.userBudget?.budgetId || !this.userId) {
      console.error("Cannot delete category: user or budget information is missing.");
      return;
    }

    if (confirm(`Are you sure you want to delete the category "${categoryName}"? All associated transactions will also be deleted.`)) {
      try {
        await this.budgetService.deleteCategory(this.userBudget.budgetId, categoryName);
        await this.transactionService.deleteTransactionsByCategory(this.userId, categoryName);

        this.loadBudget();
        this.loadTransactions();
      } catch (error) {
        console.error(`Error deleting category "${categoryName}":`, error);
      }
    }
  }

  addBudgetDialogue() {
    this.displayAddBudget = true;
  }

  addBudget() {
    if (!this.newBudgetAmount|| !this.newBudgetName || !this.userId) {
      console.log("error: missing budget information");
      console.log("amount: " + this.newBudgetAmount + " name: " + this.newBudgetName + " id: " + this.userId)
      return;
  }
  else {
    this.userAddBudget.uid = this.userId;
    this.userAddBudget.amount = this.newBudgetAmount;
    this.userAddBudget.name = this.newBudgetName;
    this.budgetService.addBudget(this.userAddBudget);
    this.displayAddBudget = false;
  }
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