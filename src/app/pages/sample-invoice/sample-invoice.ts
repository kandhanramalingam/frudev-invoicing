import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CurrencyPipe} from "@angular/common";
import {InvoiceConfigs, InvoiceLotDetail} from "../../interfaces/lot-response.interface";
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-sample-invoice',
    imports: [
        CurrencyPipe, QuillModule
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

            console.log({ list: this.lotList, summary: this.summaryList });
        }
    }
}
