import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction, TransactionService } from '../transaction.service';

type TransactionFormData = Omit<Transaction, 'id' | 'date'>;

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './add-transaction.component.html',
  styleUrls: ['./add-transaction.component.css']
})
export class AddTransactionComponent implements OnInit {
  @Input() inputCategory?: string;
  @Input() inputId?: string | undefined;
  @Output() transactionAdded = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  transactionService = inject(TransactionService);

  transaction: TransactionFormData = {
    uid: '',
    name: '',
    category: '',
    amount: 0,
  };

  ngOnInit(): void {
    if (this.inputId) {
      this.transaction.uid = this.inputId;
    } else {
      console.error("Error: No user ID (inputId) provided to AddTransactionComponent. Cannot add transaction.");
      this.requestClose();
      return;
    }
    this.resetForm();
  }

  addTransaction(): void {
    if (!this.transaction.name.trim() || this.transaction.amount <= 0) {
      alert('Transaction name and a positive amount are required.');
      return;
    }
    if (!this.transaction.category.trim()) {
      alert('Category is required.');
      return;
    }

    this.transactionService.addTransaction(this.transaction)
      .then(() => {
        this.transactionAdded.emit();
        this.requestClose();
      })
      .catch(error => {
        console.error("Error adding transaction: ", error);
        alert("Failed to add transaction. Please try again.");
      });
  }

  resetForm(): void {
    const currentUid = this.transaction.uid; // Preserve UID
    this.transaction = {
      uid: currentUid,
      name: '',
      category: this.inputCategory || '',
      amount: 0
    };
  }

  requestClose(): void {
    this.closeModal.emit();
  }
}
