import {Component} from '@angular/core';
import {NgClass} from '@angular/common';
import {ButtonDirective, ButtonIcon, ButtonLabel} from 'primeng/button';
import {CurrencyPipe} from '@angular/common';
import {HeaderComponent} from '../../shared/header/header';
import {TableModule} from "primeng/table";

interface Customer {
    name: string;
    companyName: string;
    email: string;
    phone: string;
    balance: number;
}

@Component({
    selector: 'app-customers',
    standalone: true,
    imports: [HeaderComponent, NgClass, CurrencyPipe, TableModule, ButtonDirective, ButtonLabel, ButtonIcon],
    templateUrl: './customers.html',
    styleUrl: './customers.scss'
})
export class Customers {
    customers: Customer[] = [
        {
            name: 'Alice Johnson',
            companyName: 'Acme Corp',
            email: 'alice@acme.com',
            phone: '+1 555-1000',
            balance: 1200.5
        },
        {name: 'Bob Smith', companyName: 'Beta LLC', email: 'bob@beta.io', phone: '+1 555-2000', balance: -75.2},
        {name: 'Carol Lee', companyName: 'Gamma Inc', email: 'carol@gamma.co', phone: '+1 555-3000', balance: 540.0},
        {name: 'David Kim', companyName: 'Delta Solutions', email: 'david@delta.sol', phone: '+1 555-4000', balance: 0},
        {
            name: 'Eve Torres',
            companyName: 'Epsilon Ltd',
            email: 'eve@epsilon.ltd',
            phone: '+1 555-5000',
            balance: 250.75
        },
        {
            name: 'Frank Miller',
            companyName: 'Zeta Group',
            email: 'frank@zeta.group',
            phone: '+1 555-6000',
            balance: 890.3
        },
        {
            name: 'Grace Hopper',
            companyName: 'Omega Tech',
            email: 'grace@omega.tech',
            phone: '+1 555-7000',
            balance: 1337.0
        },
        {
            name: 'Henry Ford',
            companyName: 'AutoWorks',
            email: 'henry@autoworks.com',
            phone: '+1 555-8000',
            balance: -20.0
        },
        {name: 'Ivy Chen', companyName: 'Lotus Labs', email: 'ivy@lotuslabs.ai', phone: '+1 555-9000', balance: 42.42},
        {
            name: 'Jack Ryan',
            companyName: 'Tom Clancy Inc.',
            email: 'jack@tci.com',
            phone: '+1 555-0001',
            balance: 999.99
        },
        {
            name: 'Karen Page',
            companyName: 'Nelson & Murdock',
            email: 'karen@nm.law',
            phone: '+1 555-0002',
            balance: 10.0
        },
        {
            name: 'Luke Cage',
            companyName: 'Harlem Heroes',
            email: 'luke@harlem.org',
            phone: '+1 555-0003',
            balance: 75.0
        },
        {
            name: 'Matt Murdock',
            companyName: 'Nelson & Murdock',
            email: 'matt@nm.law',
            phone: '+1 555-0004',
            balance: 120.0
        },
        {
            name: 'Natasha Romanoff',
            companyName: 'Shield',
            email: 'natasha@shield.gov',
            phone: '+1 555-0005',
            balance: 300.0
        },
    ];

    rows = 10;
}
