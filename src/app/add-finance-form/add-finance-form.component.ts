import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FinanceService } from '../finance.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-finance-form',
  imports: [RouterLink, FormsModule],
  templateUrl: './add-finance-form.component.html',
  styleUrl: './add-finance-form.component.css'
})
export class AddFinanceFormComponent {
  constructor(private financeService: FinanceService) {}

  newFinance = {
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

  CreateFinance() {
    this.financeService.addFinance(this.newFinance);
  }
}
