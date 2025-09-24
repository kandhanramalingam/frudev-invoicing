import { Routes } from "@angular/router";
import { Customers } from "./pages/customers/customers";
import { Quotes } from "./pages/quotes/quotes";
import { Invoices } from "./pages/invoices/invoices";
import { CrudCustomer } from "./pages/customers/crud-customer/crud-customer";

export const routes: Routes = [
  { path: "", redirectTo: "customers", pathMatch: "full" },
  {
    path: "customers",
    component: Customers
  },
  { path: "customers/add", component: CrudCustomer },
  { path: "customers/edit/:id", component: CrudCustomer },
  { path: "quotes", component: Quotes },
  { path: "invoices", component: Invoices },
];
