import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Assuming Transaction interface is defined in or exported from transaction.service
import { Transaction, TransactionService } from '../transaction.service';

// This UID will be used for all transactions created through this form.
// In a real app, you'd get this from your authentication service for the logged-in user.
const staticUserId = "one";

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
  @Input() inputCategory?: string; // Input to pre-fill the category
  @Output() transactionAdded = new EventEmitter<void>(); // Event emitter for when a transaction is added
  @Output() closeModal = new EventEmitter<void>(); // Event emitter to request modal close

  transactionService = inject(TransactionService);

  transaction: Transaction = {
    uid: staticUserId,
    name: '',
    category: '', 
    amount: 0,
  };

  ngOnInit(): void {
    this.resetForm(); // Initialize form, potentially with inputCategory
  }

  addTransaction(): void {
    if (!this.transaction.name || this.transaction.amount <= 0) {
      alert('Transaction name and a positive amount are required.'); // Simple alert for now
      return;
    }
    if (!this.transaction.category) {
      alert('Category is required.');
      return;
    }

    const transactionToAdd: Transaction = { ...this.transaction };

    this.transactionService.addTransaction(transactionToAdd);
  }

  /**
   * Resets the form fields. If an inputCategory was provided,
   * it pre-fills the category field.
   */
  resetForm(): void {
    this.transaction = {
      uid: staticUserId,
      name: '',
      category: this.inputCategory || '', // Use inputCategory if available
      amount: 0
    };
  }

  /**
   * Emits an event to request the modal to be closed.
   * This can be triggered by a "Cancel" button within the form itself.
   */
  requestClose(): void {
    this.closeModal.emit();
  }
}
