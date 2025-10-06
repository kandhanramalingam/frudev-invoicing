import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CurrencyPipe} from "@angular/common";
import {InvoiceConfigs, InvoiceLotDetail} from "../../interfaces/lot-response.interface";

@Component({
  selector: 'app-sample-invoice',
    imports: [
        CurrencyPipe
    ],
  templateUrl: './sample-invoice.html',
  styleUrl: './sample-invoice.scss'
})
export class SampleInvoice implements OnChanges {

    @Input() config: InvoiceConfigs | null = null;
    @Input() lots: InvoiceLotDetail[] = [];
    lotList: InvoiceLotDetail[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lots']) {
            this.lotList = this.lots.map((i) => {
                return {
                    ...i,
                    Vat: (i.Total * parseFloat(this.config?.vat || '0')) / 100
                };
            });
        }
    }
}
