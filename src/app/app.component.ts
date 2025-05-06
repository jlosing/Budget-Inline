
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Finance, FinanceService } from './finance.service';
import { NavbarComponent } from './navbar/navbar.component';
import { AddFinanceFormComponent } from './add-finance-form/add-finance-form.component';
import { IncomeTrackingComponent } from './income-tracking/income-tracking.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AddFinanceFormComponent, RouterLink, NavbarComponent, IncomeTrackingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'BudgetInline';
  
}
