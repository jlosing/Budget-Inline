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

  ngOnInit(): void {
    this.incomeService.getIncomesOrdered().subscribe((incomes: Income[]) => {
      this.incomes = incomes;

      this.barChartLabels = incomes.map(i =>
        i.Month.toDate().toLocaleString('default', { month: 'short', year: 'numeric' })
      );

      this.barChartData.datasets[0].data = incomes.map(i => i.Amount);
    });
  }
}
