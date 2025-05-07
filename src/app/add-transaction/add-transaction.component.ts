import { Component, inject } from '@angular/core';
import { Transaction, TransactionService } from '../transaction.service';


const staticUserId = "one";

@Component({
  selector: 'app-add-transaction',
  imports: [],
  templateUrl: './add-transaction.component.html',
  styleUrl: './add-transaction.component.css'
})

  

export class AddTransactionComponent {
  transactionService = inject(TransactionService);
  
  transaction: Transaction = {
    uid: staticUserId,
    name: '',
    category: '',
    amount: 0

  }

  addTransaction() {
    this.transactionService.addTransaction(this.transaction);
    this.resetForm();
  }

  resetForm() {
    this.transaction = {
    uid: staticUserId,
    name: '',
    category: '',
    amount: 0
    }
  }

}
