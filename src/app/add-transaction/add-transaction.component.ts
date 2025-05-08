import { Component, inject, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Assuming Transaction interface is defined in or exported from transaction.service
import { Transaction, TransactionService } from '../transaction.service';


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

  transaction: Transaction = {
    uid: '',
    name: '',
    category: '', 
    amount: 0,
  };

  ngOnInit(): void {
    if (this.inputId) {
      this.transaction.uid = this.inputId;
    }
    else {
      console.log("error: no id")
      this.requestClose();
    }
    this.resetForm(); 
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
    console.log("add called");
    this.transactionService.addTransaction(transactionToAdd);
    this.requestClose();
  }

  /**
   * Resets the form fields. If an inputCategory was provided,
   * it pre-fills the category field.
   */
  resetForm(): void {
    if (this.inputId) {
      this.transaction.uid = this.inputId;
    
    this.transaction = {
      uid: this.inputId,
      name: '',
      category: this.inputCategory || '', // Use inputCategory if available
      amount: 0
    }; 
    }
    else {this.requestClose()}
  }

  /**
   * Emits an event to request the modal to be closed.
   * This can be triggered by a "Cancel" button within the form itself.
   */
  requestClose(): void {
    this.closeModal.emit();
  }
}
