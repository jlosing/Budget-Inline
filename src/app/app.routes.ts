import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AddFinanceFormComponent } from './add-finance-form/add-finance-form.component';
import { AddFeedbackFormComponent } from './add-feedback-form/add-feedback-form.component';
import { IncomeTrackingComponent } from './income-tracking/income-tracking.component';
import { ViewFeedbackFormComponent } from './view-feedback-form/view-feedback-form.component';
import { BudgetViewComponent } from './budget-view/budget-view.component';
import { TransactionComponent } from './transaction/transaction.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';


export const routes: Routes = [
    { 
        path: '', 
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
    {
        path: 'viewFeedback',
        component: ViewFeedbackFormComponent,
        title: 'View Feedback',
    },
    {
        path: 'view-budget',
        component: BudgetViewComponent,
        title: 'Budget View',
    },
    {
        path: 'transaction',
        component: TransactionComponent,
        title: 'Transactions',
    },
    {

        path: 'register',
        component: RegisterComponent,
        title: 'Register',
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
    },
];

