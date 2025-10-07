import {Component} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {NgClass} from "@angular/common";

export interface NavItem {
    label: string;
    icon?: string; // optional SVG path or class name
    route?: string;
    children?: NavItem[];
    open?: boolean; // UI state (optional initial)
}

@Component({
    selector: 'app-sidebar',
    imports: [
        RouterLink,
        NgClass
    ],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.scss'
})
export class Sidebar {
    menu: NavItem[] = [
        {label: "Auctions", icon: "fa fa-gavel", route: "/auctions",},
        {label: "Lots", route: "/lots", icon: "fa fa-list"},
        {label: "Buyers", route: "/buyers", icon: "fa fa-users"},
        {label: "Invoice Config", route: "/invoice-config", icon: "fa fa-sliders"},
        {label: "Manage", route: "/manage", icon: "fa fa-cogs"}
    ];

    constructor(public router: Router) {
    }

    // toggle open state for a menu item (mutates the item)
    toggle(item: NavItem, event?: Event) {
        if (event) event.stopPropagation();
        item.open = !item.open;
    }

    // navigate if route exists
    go(item: NavItem, event?: Event) {
        if (event) event.stopPropagation();
        if (item.route) {
            this.router.navigate([item.route]);
        } else if (item.children) {
            this.toggle(item);
        }
    }

    // helper to detect if route is active (also checks nested routes)
    isActive(item: NavItem): boolean {
        if (item.route && this.router.isActive(item.route, false)) return true;
        if (item.children) {
            return item.children.some((c) => this.isActive(c));
        }
        return false;
    }
}
