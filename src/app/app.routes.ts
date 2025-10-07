import {Routes} from "@angular/router";
import { DbInitResolver } from "./core/db-init.resolver";

export const routes: Routes = [
    { path: "", redirectTo: "auctions", pathMatch: "full" },
    { path: "auctions", loadComponent: () => import("./pages/auctions/auctions").then(m => m.Auctions), resolve: { db: DbInitResolver } },
    { path: "lots", loadComponent: () => import("./pages/lots/lots").then(m => m.AuctionLots), resolve: { db: DbInitResolver } },
    { path: "buyers", loadComponent: () => import("./pages/buyers/buyers").then(m => m.AuctionBuyers), resolve: { db: DbInitResolver } },
    { path: "invoice-config", loadComponent: () => import("./pages/invoice-config/invoice-config").then(m => m.InvoiceConfig), resolve: { db: DbInitResolver } },
    { path: "sample-invoice", loadComponent: () => import("./pages/sample-invoice/sample-invoice").then(m => m.SampleInvoice), resolve: { db: DbInitResolver } },
    {
        path: "manage",
        loadComponent: () => import("./pages/manage/manage").then(m => m.Manage),
        resolve: { db: DbInitResolver },
        children: [
            { path: "", redirectTo: "vehicle-types", pathMatch: "full" },
            { path: "vehicle-types", loadComponent: () => import("./pages/manage/vehicle-types/vehicle-types").then(m => m.VehicleTypes) },
            { path: "vehicle-categories", loadComponent: () => import("./pages/manage/vehicle-categories/vehicle-categories").then(m => m.VehicleCategories) }
        ]
    },
];
