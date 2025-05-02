import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AddFinanceFormComponent } from './add-finance-form/add-finance-form.component';

export const routes: Routes = [
    {
        path: '',
        component: AppComponent,
        title: 'Home',
    },
    {
        path: 'add',
        component: AddFinanceFormComponent,
        title: 'Add Finance',
    },
];
