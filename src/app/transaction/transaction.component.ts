import { Component, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Transaction, TransactionService } from '../transaction.service';


@Component({
  selector: 'app-transaction',
  imports: [CommonModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent implements OnInit{
  transactions: Transaction[] = [];

  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    const staticId = "one";

    this.transactionService.getTransactionsId(staticId).subscribe((fetchedTransactions: Transaction[]) => {
      this.transactions = fetchedTransactions;
    })
  }

}
