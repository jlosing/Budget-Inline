import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Finance, FinanceService } from './finance.service';
import { AddFinanceFormComponent } from './add-finance-form/add-finance-form.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AddFinanceFormComponent, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'BudgetInline';

  financeService = inject(FinanceService);

  finance: Finance = {
    id: '',
    name: '',
    source: '',
    description: '',
    isIncome: true, //For debt set to false
    balance: 0,
    isReoccuring: true, //If false, everything below here should be null
    interestRate: 0,
    interestFrequency: 0, //Frequency in days
    interestEndDate: '',
    income: 0,
    incomeFrequency: 0, //Frequency in days
    incomeEndDate: '',
    expense: 0,
    expenseFrequency: 0, //Frequency in days
    expenseEndDate: '',
  }
  editFinanceId: string | null = null;

  finances: Finance[] = []

  ngOnInit(): void {
    this.financeService.getFinances().subscribe(data => this.finances = data);
  }

  addFinance() {
    this.financeService.addFinance(this.finance);
    this.resetForm();
  }

  resetForm() {
    this.finance = {
      id: '',
      name: '',
      source: '',
      description: '',
      isIncome: true, //For debt set to false
      balance: 0,
      isReoccuring: true, //If false, everything below here should be null
      interestRate: 0,
      interestFrequency: 0, //Frequency in days
      interestEndDate: '',
      income: 0,
      incomeFrequency: 0, //Frequency in days
      incomeEndDate: '',
      expense: 0,
      expenseFrequency: 0, //Frequency in days
      expenseEndDate: '',
    }
    this.editFinanceId = null;
  }

  setEditFinance(finance: Finance) {
    this.finance = {...finance};
    this.editFinanceId = finance.id;
  }

  deleteFinance(id: string) {
    this.financeService.deleteFinance(id);
  }

  updateFinance() {
    this.financeService.updateFinance(this.finance);
  }
  
}
