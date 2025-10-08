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
        path: "vehicle",
        loadComponent: () => import("./pages/manage/manage").then(m => m.Manage),
        resolve: { db: DbInitResolver },
        children: [
            { path: "", redirectTo: "vehicles", pathMatch: "full" },
            { path: "vehicle-types", loadComponent: () => import("./pages/manage/vehicle-types/vehicle-types").then(m => m.VehicleTypes) },
            { path: "vehicle-categories", loadComponent: () => import("./pages/manage/vehicle-categories/vehicle-categories").then(m => m.VehicleCategories) },
            { path: "vehicle-compartments", loadComponent: () => import("./pages/manage/vehicle-compartments/vehicle-compartments").then(m => m.VehicleCompartments) },
            { path: "vehicles", loadComponent: () => import("./pages/manage/vehicles/vehicles").then(m => m.Vehicles) }
        ]
    },
    {
        path: "species",
        loadComponent: () => import("./pages/species/species").then(m => m.Species),
        resolve: { db: DbInitResolver },
        children: [
            { path: "", redirectTo: "species-list", pathMatch: "full" },
            { path: "species-list", loadComponent: () => import("./pages/species/species-list/species-list").then(m => m.SpeciesList) },
            { path: "species-categories", loadComponent: () => import("./pages/species/species-categories/species-categories").then(m => m.SpeciesCategories) }
        ]
    },
];
