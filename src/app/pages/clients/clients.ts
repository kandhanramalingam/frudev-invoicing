import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-clients',
  imports: [RouterOutlet, NgClass],
  templateUrl: './clients.html',
  styleUrl: './clients.scss'
})
export class Clients {
  tabs = [
    { label: 'Clients', route: '/clients/clients-list' }
  ];

  constructor(private router: Router) {}

  isActiveTab(route: string): boolean {
    return this.router.url.includes(route);
  }

  navigateToTab(route: string) {
    this.router.navigate([route]);
  }
}