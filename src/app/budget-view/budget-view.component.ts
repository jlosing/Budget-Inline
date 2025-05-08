import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { Budget, BudgetService } from '../budget.service';
import { Transaction, TransactionService } from '../transaction.service';
import { UserService } from '../user.service';
import { Timestamp } from '@angular/fire/firestore';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartData } from 'chart.js'; // Changed ChartType to ChartData here for pieChartData

type BudgetOmitData = Omit<Budget, 'budgetId' | 'categories'>;

@Component({
  selector: 'app-budget-view',
  standalone: true,
  imports: [
    CommonModule,
    AddTransactionComponent,
    FormsModule,
    NgChartsModule
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

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Spending by Category'
      },
      legend: {
        position: 'top',
      },
    }
  };

  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [ // Optional: Add some default colors
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#C9CBCF', '#7BC225'
        ]
      }
    ]
  };
  public pieChartType: 'pie' = 'pie'; // Made type more specific
  public pieChartLegend = true; // This can be controlled via options too
  public pieChartPlugins = [];

  objectKeys = Object.keys;

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
        this.updatePieChartData();
      }
    });
  }

  loadBudget(): void {
    if (!this.userId) {
      this.userBudget = null;
      this.isLoadingBudget = false;
      this.updatePieChartData();
      return;
    }
    this.isLoadingBudget = true;
    this.budgetSubscription = this.budgetService.getUserBudget(this.userId).subscribe({
      next: (budget) => {
        this.userBudget = budget;
        this.isLoadingBudget = false;
        this.updatePieChartData();
      },
      error: (err) => {
        console.error(`Error fetching budget for UID "${this.userId}":`, err);
        this.isLoadingBudget = false;
        this.updatePieChartData();
      }
    });
  }

  deleteTransaction(id: string | undefined) {
    if(id == undefined) {
      console.log("undefined id");
      return
    }
    else {
      this.transactionService.deleteTransaction(id);
    }
  }

  loadTransactions(): void {
    if (!this.userId) {
      this.transactions = [];
      this.isLoadingTransactions = false;
      this.updatePieChartData();
      return;
    }
    this.isLoadingTransactions = true;
    this.transactionsSubscription = this.transactionService.getTransactionsId(this.userId).subscribe({
      next: (fetchedTransactions: Transaction[]) => {
        const processedTransactions = fetchedTransactions.map(transaction => {
          if (transaction.date && typeof (transaction.date as any).toDate === 'function') {
            return {
              ...transaction,
              date: (transaction.date as Timestamp).toDate()
            };
          } else if (transaction.date instanceof Date) {
            return transaction;
          }
          return transaction;
        });
        this.transactions = processedTransactions;
        this.isLoadingTransactions = false;
        this.updatePieChartData();
      },
      error: (err) => {
        console.error(`Error fetching transactions for UID "${this.userId}":`, err);
        this.isLoadingTransactions = false;
        this.updatePieChartData();
      }
    });
  }

  updatePieChartData(): void {
    if (this.userBudget && this.userBudget.categories && this.transactions) {
      const categoryKeys = Object.keys(this.userBudget.categories);
      const spentData: number[] = [];
      const labels: string[] = [];
  
      categoryKeys.forEach(key => {
        const totalSpent = this.getCategoryTotalSpent(key);
        if (totalSpent > 0) { 
          labels.push(key);
          spentData.push(totalSpent);
        }
      });
  
      this.pieChartData = {
        labels: labels,
        datasets: [
          {
            data: spentData,
            backgroundColor: this.pieChartData.datasets[0].backgroundColor // Preserve original colors
          }
        ]
      };
    } else {
      this.pieChartData = {
        labels: [],
        datasets: [{ data: [], backgroundColor: this.pieChartData.datasets[0].backgroundColor }]
      };
    }
  }

  getTransactionsForCategory(categoryKey: string): Transaction[] {
    return this.transactions.filter(t => t.category === categoryKey);
  }

  getCategoryTotalSpent(categoryKey: string): number {
    const transactionsForCategory = this.getTransactionsForCategory(categoryKey);
    return transactionsForCategory.reduce((sum, transaction) => sum + transaction.amount, 0);
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

  cancelAddCategory() {
    this.displayAddCategory = false;
    this.categoryName = '';
    this.categoryAmount = null;
  }

  async onClickAdd() {
    if (this.categoryName && this.categoryAmount != null && this.userBudget?.budgetId && this.userId) {
      try {
        await this.budgetService.addCategoryToBudget(this.userBudget.budgetId, this.categoryName, this.categoryAmount);
        this.categoryAmount = null;
        this.categoryName = '';
        this.displayAddCategory = false;
        this.loadBudget();
      } catch (error) {
        console.error("Error adding category to budget:", error);
      }
    } else {
      console.log("Error adding budget: Invalid data or budget ID missing.");
    }
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
    this.newBudgetName = '';
    this.newBudgetAmount = null;
  }

  cancelAddBudget() {
    this.displayAddBudget = false;
    this.newBudgetName = '';
    this.newBudgetAmount = null;
  }

  addBudget() {
    if (!this.newBudgetAmount|| !this.newBudgetName || !this.userId) {
      return;
    }
    else {
      this.userAddBudget.uid = this.userId;
      this.userAddBudget.amount = this.newBudgetAmount;
      this.userAddBudget.name = this.newBudgetName;
      this.budgetService.addBudget(this.userAddBudget);
      this.displayAddBudget = false;
      this.newBudgetName = '';
      this.newBudgetAmount = null;
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