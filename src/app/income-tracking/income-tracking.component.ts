import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { Income } from '../income-tracking.service';
import { IncomeTrackingService } from '../income-tracking.service';
import { UserService } from '../user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-income-tracking',
  standalone: true,
  templateUrl: './income-tracking.component.html',
  styleUrl: './income-tracking.component.css',
  imports: [CommonModule, NgChartsModule],
})
export class IncomeTrackingComponent implements OnInit, OnDestroy {
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
  incomeTrendMessage: string = 'Insufficient data to determine trend.';

  public get isNumericPercentageChangeInfinite(): boolean {
    return this.numericPercentageChange === Number.POSITIVE_INFINITY;
  }

  trendDisplayParts: {
    prefix?: string;
    trendText?: string;
    suffix?: string;
    status?: 'positive' | 'negative' | 'neutral' | 'significant_increase_from_zero' | 'no_change_from_zero';
  } | null = null;

  numericPercentageChange: number | null = null;
  statusMessage: string = 'Insufficient data to determine trend.';

  public getFormattedDateForIncome(income: Income | null): string {
    if (income && income.Month && typeof income.Month.toDate === 'function') {
      try {
        return income.Month.toDate().toLocaleString('default', { month: 'long', year: 'numeric' });
      } catch (e) {
        console.error("Error formatting date:", e, income.Month);
        return 'Invalid Date';
      }
    }
    return '';
  }

  private userService = inject(UserService);
  private userSubscription: Subscription | undefined;
  private incomeSubscription: Subscription | undefined;

  userId: string | null = null;


  ngOnInit(): void {
    this.userSubscription = this.userService.user$.subscribe({
      next: (user) => {
        if (user) {
          this.userId = user.uid;
          console.log('User logged in. User ID:', this.userId);
          this.getIncome(this.userId);
        } else {
          this.userId = null;
          console.log('No user is currently logged in.');
          this.incomes = [];
          this.barChartData = { labels: [], datasets: [{ data: [], label: 'Monthly Income' }] };
          this.latestMonthIncome = null;
          this.secondLatestMonthIncome = null;
          this.numericPercentageChange = null;
          this.trendDisplayParts = null;
          this.statusMessage = 'Please log in to view your income data.';
        }
      },
      error: (err) => {
        console.error('Error observing user authentication state:', err);
        this.userId = null;
        this.statusMessage = 'Error loading user data. Please try again.';
      }
    });
  }

  getIncome(uid: string): void {
    if (!uid) {
      console.log('getIncome called without a valid UID.');
      this.incomes = [];
      this.barChartData = { labels: [], datasets: [{ data: [], label: 'Monthly Income' }] };
      this.latestMonthIncome = null;
      this.secondLatestMonthIncome = null;
      this.numericPercentageChange = null;
      this.trendDisplayParts = null;
      this.statusMessage = 'Cannot load income data without a user ID.';
      return;
    }

    console.log(`Attempting to fetch income for UID: ${uid}`);

    this.incomeSubscription = this.incomeService.getIncomesOrdered(uid).subscribe({
      next: (fetchedIncomes: Income[]) => {
        console.log('Income data received. Count:', fetchedIncomes.length);
        console.log('Fetched Incomes (Raw):', JSON.stringify(fetchedIncomes));

        this.incomes = fetchedIncomes;

        this.latestMonthIncome = null;
        this.secondLatestMonthIncome = null;
        this.numericPercentageChange = null;
        this.trendDisplayParts = null;
        this.statusMessage = 'Insufficient data to determine trend.';

        if (fetchedIncomes && fetchedIncomes.length > 0) {
          const newLabels = fetchedIncomes.map(i => i.Month.toDate().toLocaleString('default', { month: 'short', year: 'numeric' }));
          const newData = fetchedIncomes.map(i => i.Amount);
          this.barChartData = {
            labels: newLabels,
            datasets: [{ data: newData, label: this.barChartData.datasets[0]?.label || 'Monthly Income' }]
          };
          console.log('Chart data updated.');

          if (fetchedIncomes.length >= 2) {
            console.log('Processing trend for two or more months.');
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

            if (secondLatestAmount !== 0) {
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
              this.numericPercentageChange = Infinity;
              this.trendDisplayParts.trendText = `${latestAmount.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}, up from $0`;
              this.trendDisplayParts.status = 'significant_increase_from_zero';
            } else {
              this.numericPercentageChange = 0;
              this.trendDisplayParts.trendText = `still $0`;
              this.trendDisplayParts.status = 'no_change_from_zero';
            }

            this.statusMessage = '';

          } else if (fetchedIncomes.length === 1) {
            this.latestMonthIncome = fetchedIncomes[0];
            const latestMonthName = this.latestMonthIncome.Month.toDate().toLocaleString('default', { month: 'long', year: 'numeric' });
            this.statusMessage = `Only one month of data available (${latestMonthName}: ${this.latestMonthIncome.Amount.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}). More data needed for comparison.`;
            console.log('Only one month of data.');
          }
        } else {
          console.log('No income data found for this user.');
          this.statusMessage = 'No income data found for your account.';
          this.barChartData = { labels: [], datasets: [{ data: [], label: 'Monthly Income' }] };
        }
      },
      error: (err) => {
        console.error(`Error fetching income data for UID "${uid}":`, err);
        this.statusMessage = 'Error loading income data. Please try again.';
        this.incomes = [];
        this.barChartData = { labels: [], datasets: [{ data: [], label: 'Monthly Income' }] };
        this.latestMonthIncome = null;
        this.secondLatestMonthIncome = null;
        this.numericPercentageChange = null;
        this.trendDisplayParts = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.incomeSubscription) {
      this.incomeSubscription.unsubscribe();
    }
  }
}
