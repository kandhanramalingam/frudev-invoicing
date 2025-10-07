import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CurrencyPipe, NgClass} from "@angular/common";
import {InvoiceConfigs, InvoiceLotDetail} from "../../interfaces/lot-response.interface";
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';
import {AccordionModule} from "primeng/accordion";

interface Expense {
  name: string;
  note: string;
  beforeVat: number;
  vat: number;
  inclusive: number;
}

interface Due {
  name: string;
  beforeVat: number;
  vat: number;
  inclusive: number;
}

interface Payment {
  method: string;
  note: string;
  amount: number;
}

@Component({
  selector: 'app-sample-invoice',
    imports: [
        CurrencyPipe, QuillModule, FormsModule, AccordionModule
    ],
  templateUrl: './sample-invoice.html',
  styleUrl: './sample-invoice.scss'
})
export class SampleInvoice implements OnChanges {
    @Input() config: InvoiceConfigs | null = null;
    @Input() lots: InvoiceLotDetail[] = [];
    lotList: InvoiceLotDetail[] = [];
    totalOfLot = {m: 0, f: 0, t: 0, amount: 0, vat: 0};
    summaryList: { Summary: string; QTY: number; Amount: number; RPerItem: number }[] = [];
    totalOfSummary = {qty: 0, amount: 0};
    
    // Form data
    expenses: Expense[] = [];
    dues: Due[] = [];
    payments: Payment[] = [];
    note: string = '';

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lots'] && changes['lots'].currentValue != changes['lots'].previousValue) {
            this.lotList = this.lots.map((i) => {
                this.totalOfLot.m += i.M;
                this.totalOfLot.f += i.F;
                this.totalOfLot.t += i.T;
                this.totalOfLot.amount += i.Total;
                const Vat = (i.Total * parseFloat(this.config?.vat || '0')) / 100;
                this.totalOfLot.vat += Vat;
                return { ...i, Vat };
            });

            // Generate summary
            const summaryMap: Record<string, { qty: number; amount: number; }> = {};

            this.lotList.forEach((lot) => {
                if (!summaryMap[lot.Item]) {
                    summaryMap[lot.Item] = { qty: 0, amount: 0 };
                }
                summaryMap[lot.Item].qty += lot.T;
                summaryMap[lot.Item].amount += lot.Total;
            });

            this.summaryList = Object.keys(summaryMap).map((item) => {
                const data = summaryMap[item];
                this.totalOfSummary.qty += data.qty;
                this.totalOfSummary.amount += data.amount;
                return {
                    Summary: item,
                    QTY: data.qty,
                    Amount: data.amount,
                    RPerItem: data.amount / data.qty
                };
            });
        }
    }
    
    addExpense() {
        this.expenses.push({
            name: '',
            note: '',
            beforeVat: 0,
            vat: 0,
            inclusive: 0
        });
    }
    
    removeExpense(index: number) {
        this.expenses.splice(index, 1);
    }
    
    calculateExpenseVat(expense: Expense) {
        const vatRate = parseFloat(this.config?.vat || '15');
        expense.vat = (expense.beforeVat * vatRate) / 100;
        expense.inclusive = expense.beforeVat + expense.vat;
    }
    
    getTotalExpenses(field: keyof Expense): number {
        return this.expenses.reduce((total, expense) => {
            const value = expense[field];
            return total + (typeof value === 'number' ? value : 0);
        }, 0);
    }
    
    addDue() {
        this.dues.push({
            name: '',
            beforeVat: 0,
            vat: 0,
            inclusive: 0
        });
    }
    
    removeDue(index: number) {
        this.dues.splice(index, 1);
    }
    
    calculateDueVat(due: Due) {
        const vatRate = parseFloat(this.config?.vat || '15');
        due.vat = (due.beforeVat * vatRate) / 100;
        due.inclusive = due.beforeVat + due.vat;
    }
    
    getTotalDues(field: keyof Due): number {
        return this.dues.reduce((total, due) => {
            const value = due[field];
            return total + (typeof value === 'number' ? value : 0);
        }, 0);
    }
    
    addPayment() {
        this.payments.push({
            method: '',
            note: '',
            amount: 0
        });
    }
    
    removePayment(index: number) {
        this.payments.splice(index, 1);
    }
    
    getTotalPayments(): number {
        return this.payments.reduce((total, payment) => total + (payment.amount || 0), 0);
    }
}
