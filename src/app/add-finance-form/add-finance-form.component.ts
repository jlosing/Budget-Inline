import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Finance, FinanceService } from '../finance.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-finance-form',
  imports: [RouterLink, FormsModule],
  templateUrl: './add-finance-form.component.html',
  styleUrl: './add-finance-form.component.css'
})
export class AddFinanceFormComponent implements OnInit {

  financeService = inject(FinanceService);

  finance: Finance = {
    id: '',
    user_id: '',
    name: '',
    amount: 0,
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
      user_id: '',
      name: '',
      amount: 0,
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
