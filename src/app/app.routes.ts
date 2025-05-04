import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AddFinanceFormComponent } from './add-finance-form/add-finance-form.component';
import { AddFeedbackFormComponent } from './add-feedback-form/add-feedback-form.component';
import { IncomeTrackingComponent } from './income-tracking/income-tracking.component';

export const routes: Routes = [
    // {
    //     path: '',
    //     component: AppComponent,
    //     title: 'Home',
    // },
    { 
        path: 'income', 
        component: IncomeTrackingComponent,
        title: 'Income'
    },   
    {
        path: 'add',
        component: AddFinanceFormComponent,
        title: 'Add Finance',
    },
    {
        path: 'feedback',
        component: AddFeedbackFormComponent,
        title: 'Feedback',
    },
];

