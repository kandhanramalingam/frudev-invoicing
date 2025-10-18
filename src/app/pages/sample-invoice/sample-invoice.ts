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
    
    async generatePDFContent(): Promise<Uint8Array> {
        // Import jsPDF and html2canvas dynamically
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;
        
        const invoiceElement = document.getElementById('invoiceContent');
        if (invoiceElement) {
            try {
                // Capture the element as canvas
                const canvas = await html2canvas(invoiceElement, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                });
                
                // Create PDF
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgData = canvas.toDataURL('image/png');
                
                const imgWidth = 210; // A4 width in mm
                const pageHeight = 295; // A4 height in mm
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                
                let position = 0;
                
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                // Return PDF as Uint8Array
                const pdfOutput = pdf.output('arraybuffer');
                return new Uint8Array(pdfOutput);
            } catch (error) {
                console.error('Error generating PDF:', error);
            }
        }
        
        // Fallback to HTML content
        const content = this.generateInvoiceHTML();
        return new TextEncoder().encode(content);
    }
    
    generateInvoiceHTML(): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { text-align: center; margin-bottom: 20px; }
                .total { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>INVOICE</h1>
                <p>Contact: ${this.config?.awa_contact || 'N/A'}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Lot</th>
                        <th>Item</th>
                        <th>M</th>
                        <th>F</th>
                        <th>T</th>
                        <th>Amount</th>
                        <th>VAT</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.lotList.map(lot => `
                        <tr>
                            <td>${lot.Lot}</td>
                            <td>${lot.Item}</td>
                            <td>${lot.M}</td>
                            <td>${lot.F}</td>
                            <td>${lot.T}</td>
                            <td>R${lot.Amount.toFixed(2)}</td>
                            <td>R${lot.Vat.toFixed(2)}</td>
                            <td>R${lot.Total.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr class="total">
                        <td colspan="2">TOTAL</td>
                        <td>${this.totalOfLot.m}</td>
                        <td>${this.totalOfLot.f}</td>
                        <td>${this.totalOfLot.t}</td>
                        <td>R${this.totalOfLot.amount.toFixed(2)}</td>
                        <td>R${this.totalOfLot.vat.toFixed(2)}</td>
                        <td>R${(this.totalOfLot.amount + this.totalOfLot.vat).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </body>
        </html>
        `;
    }
}
