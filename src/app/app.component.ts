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
export class AppComponent {
  title = 'BudgetInline';
  
}
