import { Component } from '@angular/core';
import {TieredMenu} from "primeng/tieredmenu";
import {MenuItem} from "primeng/api";

@Component({
  selector: 'app-sidebar',
    imports: [
        TieredMenu
    ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
    items: MenuItem[] = [
        {
            label: "Customers",
            icon: "fa fa-user",
            routerLink: "/customers"
        },
        {
            label: "Quotes",
            icon: "fa fa-file-invoice",
            routerLink: "/quotes",
        },
        {
            label: "Invoices",
            icon: "fa fa-file-invoice-dollar",
            routerLink: "/invoices",
        }
    ];
}
