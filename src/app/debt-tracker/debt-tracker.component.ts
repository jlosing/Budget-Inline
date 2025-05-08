

import { FormsModule} from '@angular/forms'; // Import FormsModule
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Debt {
  id: number;
  name: string;
  amount: number;
}

@Component({
  selector: 'app-debt-tracker',
  imports: [
    FormsModule,
    CommonModule,
    RouterModule // Add FormsModule to imports
  ],
  templateUrl: './debt-tracker.component.html',
  styleUrls: ['./debt-tracker.component.css'],
})
export class DebtTrackerComponent {
  debts: Debt[] = [];
  newDebt: Debt = { id: 0, name: '', amount: 0 };

  get totalDebt(): number {
    return this.debts.reduce((sum, debt) => sum + debt.amount, 0);
  }

  addDebt(): void {
    if (this.newDebt.name && this.newDebt.amount > 0) {
      const newId = this.debts.length > 0 ? this.debts[this.debts.length - 1].id + 1 : 1;
      this.debts.push({ ...this.newDebt, id: newId });
      this.resetForm();
    }
  }

  removeDebt(id: number): void {
    this.debts = this.debts.filter((debt) => debt.id !== id);
  }

  resetForm(): void {
    this.newDebt = { id: 0, name: '', amount: 0 };
  }
}