import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-quote',
  imports: [RouterOutlet, NgClass],
  templateUrl: './quote.html',
  styleUrl: './quote.scss'
})
export class Quote {
  tabs = [
    { label: 'Quote Wrapper', route: '/quote/quote-wrapper' }
  ];

  constructor(private router: Router) {}

  isActiveTab(route: string): boolean {
    return this.router.url.includes(route);
  }

  navigateToTab(route: string) {
    this.router.navigate([route]);
  }
}