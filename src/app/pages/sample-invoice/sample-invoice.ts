import { Component } from '@angular/core';
import {CurrencyPipe} from "@angular/common";

@Component({
  selector: 'app-sample-invoice',
    imports: [
        CurrencyPipe
    ],
  templateUrl: './sample-invoice.html',
  styleUrl: './sample-invoice.scss'
})
export class SampleInvoice {
    lotDetails = [
        {lot: '01-A002', buyer: '30', item: 'Implala Young', m: 1, f: 2, t: 4, amount: 200, total: 2000,  vat: 120},
        {lot: '01-A002', buyer: '30', item: 'Implala Young', m: 1, f: 2, t: 4, amount: 200, total: 2000,  vat: 120},
        {lot: '01-A002', buyer: '30', item: 'Implala Young', m: 1, f: 2, t: 4, amount: 200, total: 2000,  vat: 120},
        {lot: '01-A002', buyer: '30', item: 'Implala Young', m: 1, f: 2, t: 4, amount: 200, total: 2000,  vat: 120},
        {lot: '01-A002', buyer: '30', item: 'Implala Young', m: 1, f: 2, t: 4, amount: 200, total: 2000,  vat: 120},
        {lot: '01-A002', buyer: '30', item: 'Implala Young', m: 1, f: 2, t: 4, amount: 200, total: 2000,  vat: 120},
        {lot: '01-A002', buyer: '30', item: 'Implala Young', m: 1, f: 2, t: 4, amount: 200, total: 2000,  vat: 120},
    ];

    summaries = [
        {name: 'BLUE WILDEBEEST : GOLD BULL', qty: 100, amount: 2000, item: 20500},
        {name: 'BLUE WILDEBEEST : GOLD BULL', qty: 100, amount: 2000, item: 20500},
        {name: 'BLUE WILDEBEEST : GOLD BULL', qty: 100, amount: 2000, item: 20500},
        {name: 'BLUE WILDEBEEST : GOLD BULL', qty: 100, amount: 2000, item: 20500},
        {name: 'BLUE WILDEBEEST : GOLD BULL', qty: 100, amount: 2000, item: 20500},
        {name: 'BLUE WILDEBEEST : GOLD BULL', qty: 100, amount: 2000, item: 20500},
        {name: 'BLUE WILDEBEEST : GOLD BULL', qty: 100, amount: 2000, item: 20500},
    ];
}
