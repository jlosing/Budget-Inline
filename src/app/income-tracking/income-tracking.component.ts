import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { Income, IncomeTrackingService } from '../income-tracking.service';
import { UserService } from '../user.service';
import { Subscription } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

interface MonthOption {
  value: number;
  name: string;
  firstDayUTCTimestamp: Timestamp;
}

@Component({
  selector: 'app-income-tracking',
  standalone: true,
  templateUrl: './income-tracking.component.html',
  styleUrl: './income-tracking.component.css',
  imports: [CommonModule, NgChartsModule, FormsModule],
})
export class IncomeTrackingComponent implements OnInit, OnDestroy {
  incomes: Income[] = [];

  public barChartOptions: ChartOptions = {
    responsive: true,
  };

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Monthly Income', backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgb(75, 192, 192)' }
    ]
  };

  private incomeService = inject(IncomeTrackingService);
  private userService = inject(UserService);

  latestMonthIncome: Income | null = null;
  secondLatestMonthIncome: Income | null = null;
  numericPercentageChange: number | null = null;
  trendDisplayParts: {
    prefix?: string;
    trendText?: string;
    suffix?: string;
    status?: 'positive' | 'negative' | 'neutral' | 'significant_increase_from_zero' | 'no_change_from_zero';
  } | null = null;
  statusMessage: string = 'Insufficient data to determine trend.';

  private userSubscription: Subscription | undefined;
  private incomeSubscription: Subscription | undefined;
  userId: string | null = null;

  displayAddIncome = false;
  newIncomeAmount: number | null = null;
  newIncomeDate: Timestamp | null = null;

  monthOptions: MonthOption[] = [];
  selectedMonthValueForIncome: number | null = null;

  public get isNumericPercentageChangeInfinite(): boolean {
    return this.numericPercentageChange === Number.POSITIVE_INFINITY;
  }

  constructor() {}

  ngOnInit(): void {
    this.populateMonthOptions();
    console.log('LOG: Month options populated in ngOnInit:', this.monthOptions);
    this.userSubscription = this.userService.user$.subscribe({
      next: (user) => {
        if (user) {
          this.userId = user.uid;
          console.log('LOG: ngOnInit - User signed in. UserID:', this.userId);
          this.getIncome(this.userId);
        } else {
          console.log('LOG: ngOnInit - User signed out.');
          this.userId = null;
          this.incomes = [];
          this.barChartData = { labels: [], datasets: [{ data: [], label: 'Monthly Income', backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgb(75, 192, 192)' }] };
          this.latestMonthIncome = null;
          this.secondLatestMonthIncome = null;
          this.numericPercentageChange = null;
          this.trendDisplayParts = null;
          this.statusMessage = 'Please log in to view your income data.';
        }
      },
      error: (err) => {
        console.error('LOG: Error observing user authentication state:', err);
        this.userId = null;
        this.statusMessage = 'Error loading user data. Please try again.';
      }
    });
  }

  populateMonthOptions(): void {
    const currentYear = new Date().getFullYear();
    const options: MonthOption[] = [];
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' });
      const jsDateUTC = new Date(Date.UTC(currentYear, i, 1, 0, 0, 0, 0));
      const firestoreTimestamp = Timestamp.fromDate(jsDateUTC);
      options.push({
        value: i + 1,
        name: monthName,
        firstDayUTCTimestamp: firestoreTimestamp
      });
    }
    this.monthOptions = options;
  }

  getIncome(uid: string): void {
    if (!uid) {
      this.incomes = [];
      this.barChartData = { labels: [], datasets: [{ data: [], label: 'Monthly Income', backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgb(75, 192, 192)' }] };
      this.latestMonthIncome = null;
      this.secondLatestMonthIncome = null;
      this.numericPercentageChange = null;
      this.trendDisplayParts = null;
      this.statusMessage = 'Cannot load income data without a user ID.';
      return;
    }

    console.log(`LOG: getIncome called for UID: ${uid}`);

    if (this.incomeSubscription) {
      this.incomeSubscription.unsubscribe();
    }

    this.incomeSubscription = this.incomeService.getIncomesOrdered(uid).subscribe({
      next: (fetchedIncomes: Income[]) => {
        console.log('LOG: Fetched incomes from Firestore:', JSON.parse(JSON.stringify(fetchedIncomes)));

        this.incomes = fetchedIncomes.map(income => ({
          ...income,
          Month: income.Month instanceof Timestamp ? income.Month : Timestamp.fromDate(new Date((income.Month as any).seconds * 1000))
        }));

        this.latestMonthIncome = null;
        this.secondLatestMonthIncome = null;
        this.numericPercentageChange = null;
        this.trendDisplayParts = null;
        this.statusMessage = 'Insufficient data to determine trend.';

        if (this.incomes && this.incomes.length > 0) {
          console.log('LOG: Processing fetched incomes for UI.');
          const newLabels = this.incomes.map(i => {
            try {
              return i.Month.toDate().toLocaleString('default', { month: 'short', year: 'numeric' });
            } catch (e) {
              console.error("LOG: Error converting month to date string:", i.Month, e);
              return "Invalid Date";
            }
          });
          const newData = this.incomes.map(i => i.Amount);
          this.barChartData = {
            labels: newLabels,
            datasets: [{ data: newData, label: this.barChartData.datasets[0]?.label || 'Monthly Income', backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgb(75, 192, 192)' }]
          };

          if (this.incomes.length >= 2) {
            this.latestMonthIncome = this.incomes[this.incomes.length - 1];
            this.secondLatestMonthIncome = this.incomes[this.incomes.length - 2];
            const latestAmount = this.latestMonthIncome.Amount;
            const secondLatestAmount = this.secondLatestMonthIncome.Amount;
            const latestMonthName = this.getFormattedDateForIncome(this.latestMonthIncome);
            const secondLatestMonthName = this.getFormattedDateForIncome(this.secondLatestMonthIncome);

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
          } else if (this.incomes.length === 1) {
            this.latestMonthIncome = this.incomes[0];
            const latestMonthName = this.getFormattedDateForIncome(this.latestMonthIncome);
            this.statusMessage = `Only one month of data available (${latestMonthName}: ${this.latestMonthIncome.Amount.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}). More data needed for comparison.`;
          }
        } else {
          console.log('LOG: No incomes found or array is empty after fetch.');
          this.statusMessage = 'No income data found for your account.';
          this.barChartData = { labels: [], datasets: [{ data: [], label: 'Monthly Income', backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgb(75, 192, 192)' }] };
        }
      },
      error: (err) => {
        console.error(`LOG: Error fetching income data for UID "${uid}":`, err);
        this.statusMessage = 'Error loading income data. Please try again.';
      }
    });
  }

  public getFormattedDateForIncome(income: Income | null): string {
    if (income && income.Month && typeof income.Month.toDate === 'function') {
      try {
        return income.Month.toDate().toLocaleString('default', { month: 'long', year: 'numeric' });
      } catch (e) {
        console.error("LOG: Error in getFormattedDateForIncome:", e);
        return 'Invalid Date';
      }
    }
    return '';
  }

  onAddIncomeClick(): void {
    this.displayAddIncome = true;
    this.newIncomeAmount = null;
    this.selectedMonthValueForIncome = null;
    this.newIncomeDate = null;
  }

  onNewIncomeMonthSelected(): void {
    console.log('LOG: Month selection changed. Value from ngModel (selectedMonthValueForIncome):', this.selectedMonthValueForIncome, 'Type:', typeof this.selectedMonthValueForIncome);
    if (this.selectedMonthValueForIncome !== null) {
      const numericSelectedMonthValue = Number(this.selectedMonthValueForIncome);
      console.log('LOG: Numeric selected month value for find:', numericSelectedMonthValue);

      const selectedOption = this.monthOptions.find(option => option.value === numericSelectedMonthValue);
      console.log('LOG: Found option in monthOptions:', selectedOption);
      if (selectedOption) {
        this.newIncomeDate = selectedOption.firstDayUTCTimestamp;
        console.log('LOG: newIncomeDate has been SET to:', this.newIncomeDate);
      } else {
        this.newIncomeDate = null;
        console.log('LOG: No matching option found in monthOptions (after converting to number), newIncomeDate set to NULL.');
      }
    } else {
      this.newIncomeDate = null;
      console.log('LOG: selectedMonthValueForIncome is null, newIncomeDate set to NULL.');
    }
  }

  async saveNewIncome(): Promise<void> {
    console.log('LOG: saveNewIncome called. Current newIncomeAmount:', this.newIncomeAmount, 'Current newIncomeDate:', this.newIncomeDate, 'UserID:', this.userId);
    if (!this.userId) {
      alert("User not logged in. Cannot save income.");
      console.log('LOG: saveNewIncome - User not logged in.');
      return;
    }
    if (this.newIncomeAmount === null || this.newIncomeAmount <= 0) {
      alert("Please enter a valid income amount greater than zero.");
      console.log('LOG: saveNewIncome - Invalid income amount.');
      return;
    }
    if (!this.newIncomeDate) {
      alert("Please select a month for the income.");
      console.log('LOG: saveNewIncome - No month selected.');
      return;
    }

    const newIncomeEntry: Omit<Income, 'id'> = {
      uid: this.userId!,
      Amount: this.newIncomeAmount!,
      Month: this.newIncomeDate
    };

    console.log('LOG: Attempting to save new income:', JSON.parse(JSON.stringify(newIncomeEntry)));

    try {
      await this.incomeService.addIncome(newIncomeEntry);
      alert("Income added successfully!");
      console.log('LOG: Income added successfully via service.');
      this.displayAddIncome = false;
      this.newIncomeAmount = null;
      this.selectedMonthValueForIncome = null;
      this.newIncomeDate = null;
      this.getIncome(this.userId);
    } catch (error) {
      console.error("LOG: Error saving new income:", error);
      alert("Failed to save income. Please try again.");
    }
  }

  cancelAddIncome(): void {
    this.displayAddIncome = false;
    this.newIncomeAmount = null;
    this.selectedMonthValueForIncome = null;
    this.newIncomeDate = null;
    console.log('LOG: Add income cancelled.');
  }

  ngOnDestroy(): void {
    console.log('LOG: IncomeTrackingComponent ngOnDestroy called.');
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      console.log('LOG: Unsubscribed from userSubscription.');
    }
    if (this.incomeSubscription) {
      this.incomeSubscription.unsubscribe();
      console.log('LOG: Unsubscribed from incomeSubscription.');
    }
  }
}