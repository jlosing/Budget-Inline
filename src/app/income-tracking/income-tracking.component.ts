import { Component } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { NavbarComponent } from '../navbar/navbar.component';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-income-tracking',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './income-tracking.component.html',
  styleUrl: './income-tracking.component.css'
})
export class IncomeTrackingComponent {
public barChartOptions: ChartOptions = {
    responsive: true,
  };

  public barChartLabels: string[] = ['February', 'March', 'April', 'May'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public barChartData: ChartData<'bar'> = {
    labels: this.barChartLabels,
    datasets: [
      { data: [1200, 800, 400, 200], label: 'Monthly Income' }
    ]
  };
}
