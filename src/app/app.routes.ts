import {Routes} from "@angular/router";
import {Customers} from "./pages/customers/customers";
import {Quotes} from "./pages/quotes/quotes";
import {Invoices} from "./pages/invoices/invoices";

export const routes: Routes = [
    {path: "", redirectTo: "customers", pathMatch: "full"},
    {path: "customers", component: Customers},
    {path: "quotes", component: Quotes},
    {path: "invoices", component: Invoices},
];
