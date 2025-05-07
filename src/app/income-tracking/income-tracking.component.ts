import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { Income } from '../income-tracking.service';
import { IncomeTrackingService } from '../income-tracking.service';

@Component({
  selector: 'app-income-tracking',
  standalone: true,
  templateUrl: './income-tracking.component.html',
  styleUrl: './income-tracking.component.css',
  imports: [CommonModule, NgChartsModule],
})
export class IncomeTrackingComponent implements OnInit {
  incomes: Income[] = [];

  public barChartOptions: ChartOptions = {
    responsive: true,
  };

  public barChartLabels: string[] = [];

  public barChartType: ChartType = 'bar';    
  public barChartLegend = true;                 

  public barChartData: ChartData<'bar'> = {
    labels: this.barChartLabels,
    datasets: [
      { data: [], label: 'Monthly Income' }
    ]
  };

  private incomeService = inject(IncomeTrackingService);

  latestMonthIncome: Income | null = null;
  secondLatestMonthIncome: Income | null = null;
  incomeChangePercentage: number | null = null;
  incomeTrendMessage: string = 'Insufficient data to determine trend.'; // Default message

  public get isNumericPercentageChangeInfinite(): boolean {
    return this.numericPercentageChange === Number.POSITIVE_INFINITY;
  }

  // In your IncomeTrackingComponent.ts

// In your IncomeTrackingComponent.ts

trendDisplayParts: {
    prefix?: string;                 // e.g., "Income for June 2025 is "
    trendText?: string;              // e.g., "up by 10.34%" or "down by 5.00%" or "$500, up from $0"
    suffix?: string;                 // e.g., " compared to May 2025."
    status?: 'positive' | 'negative' | 'neutral' | 'significant_increase_from_zero' | 'no_change_from_zero';
} | null = null;

numericPercentageChange: number | null = null; // For the separate "Percentage Change:" line
statusMessage: string = 'Insufficient data to determine trend.'; // General status/fallback

// ... (other properties like barChartData, etc.)

// In IncomeTrackingComponent.ts

// In your IncomeTrackingComponent.ts
public getFormattedDateForIncome(income: Income | null): string {
  if (income && income.Month && typeof income.Month.toDate === 'function') {
    try {
      return income.Month.toDate().toLocaleString('default', { month: 'long', year: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", e, income.Month);
      return 'Invalid Date';
    }
  }
  return ''; // Or 'N/A' or whatever placeholder you prefer when data is missing
}

ngOnInit(): void {
  this.incomeService.getIncomesOrdered().subscribe((fetchedIncomes: Income[]) => {
    console.log('Fetched Incomes (Raw):', JSON.stringify(fetchedIncomes));
    console.log('Fetched Incomes Length:', fetchedIncomes.length);

    

    this.incomes = fetchedIncomes;

    this.latestMonthIncome = null;
    this.secondLatestMonthIncome = null;
    this.numericPercentageChange = null;
    this.trendDisplayParts = null;
    this.statusMessage = 'Insufficient data to determine trend.'; // Default message
    console.log('Initial statusMessage set to:', this.statusMessage);


    if (fetchedIncomes && fetchedIncomes.length > 0) {
      console.log('Condition (fetchedIncomes && fetchedIncomes.length > 0) is TRUE.');

      const newLabels = fetchedIncomes.map(i => i.Month.toDate().toLocaleString('default', { month: 'short', year: 'numeric' }));
      const newData = fetchedIncomes.map(i => i.Amount);
      this.barChartData = {
        labels: newLabels,
        datasets: [{ data: newData, label: this.barChartData.datasets[0]?.label || 'Monthly Income' }]
      };
      console.log('Entering Income Comparison Logic. Current fetchedIncomes.length:', fetchedIncomes.length);

      if (fetchedIncomes.length >= 2) {
        console.log('Condition (fetchedIncomes.length >= 2) is TRUE. Processing two months.');
        this.latestMonthIncome = fetchedIncomes[fetchedIncomes.length - 1];
        this.secondLatestMonthIncome = fetchedIncomes[fetchedIncomes.length - 2];

        
        const latestAmount = this.latestMonthIncome.Amount;
        const secondLatestAmount = this.secondLatestMonthIncome.Amount;
        const latestMonthName = this.latestMonthIncome.Month.toDate().toLocaleString('default', { month: 'long', year: 'numeric' });
        const secondLatestMonthName = this.secondLatestMonthIncome.Month.toDate().toLocaleString('default', { month: 'long', year: 'numeric' });

        this.trendDisplayParts = {
          prefix: `Income for ${latestMonthName} is `,
          suffix: ` compared to ${secondLatestMonthName}.`
        };
        console.log('trendDisplayParts initialized:', JSON.stringify(this.trendDisplayParts));


        if (secondLatestAmount !== 0) {
          // ... (logic for change > 0, change < 0, change === 0) ...
           const change = ((latestAmount - secondLatestAmount) / secondLatestAmount) * 100;
             this.numericPercentageChange = change;

             if (change > 0) {
               this.trendDisplayParts.trendText = `up by ${change.toFixed(2)}%`;
               this.trendDisplayParts.status = 'positive';
             } else if (change < 0) {
               this.trendDisplayParts.trendText = `down by ${Math.abs(change).toFixed(2)}%`;
               this.trendDisplayParts.status = 'negative';
             } else {
               this.trendDisplayParts.trendText = `the same`;
               this.trendDisplayParts.status = 'neutral';
             }
        } else if (latestAmount > 0) {
          // ... (logic for previous month was 0, current is positive) ...
            this.numericPercentageChange = Infinity;
            this.trendDisplayParts.trendText = `${latestAmount.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}, up from $0`;
            this.trendDisplayParts.status = 'significant_increase_from_zero';
        } else {
          // ... (logic for both are zero) ...
            this.numericPercentageChange = 0;
            this.trendDisplayParts.trendText = `still $0`;
            this.trendDisplayParts.status = 'no_change_from_zero';
        }

        // 3. CRUCIAL: Log before and after clearing statusMessage
        console.log('Before clearing statusMessage. Current statusMessage:', this.statusMessage);
        this.statusMessage = ''; // Clear default message as we have specific trend parts
        console.log('statusMessage CLEARED. New statusMessage:', this.statusMessage);
        console.log('Final trendDisplayParts:', JSON.stringify(this.trendDisplayParts));


      } else if (fetchedIncomes.length === 1) {
        console.log('Condition (fetchedIncomes.length === 1) is TRUE. Processing one month.');
        this.latestMonthIncome = fetchedIncomes[0];
        const latestMonthName = this.latestMonthIncome.Month.toDate().toLocaleString('default', { month: 'long', year: 'numeric' });
        this.statusMessage = `Only one month of data available (${latestMonthName}: ${this.latestMonthIncome.Amount.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}). More data needed for comparison.`;
        console.log('statusMessage for SINGLE month:', this.statusMessage);
      } else {
        // This case (length is 0 but > 0 check passed) shouldn't ideally be hit if the outer 'if' is correct.
        console.log('Condition (fetchedIncomes.length is 0 within the > 0 block). This is unexpected. statusMessage remains:', this.statusMessage);
      }
    } else {
      console.log('Condition (fetchedIncomes && fetchedIncomes.length > 0) is FALSE.');
      // No incomes, statusMessage remains 'Insufficient data...'
      this.barChartData = { labels: [], datasets: [{ data: [], label: 'Monthly Income' }] };
      console.log('statusMessage (no data):', this.statusMessage);
    }
    // 4. Log the final statusMessage before template uses it
    console.log('FINAL statusMessage at end of subscribe:', this.statusMessage);
  });
}
}
