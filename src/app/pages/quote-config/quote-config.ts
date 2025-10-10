import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-quote-config',
  imports: [RouterOutlet, NgClass],
  templateUrl: './quote-config.html',
  styleUrl: './quote-config.scss'
})
export class QuoteConfig {
  tabs = [
    { label: 'Quote Validity', route: '/quote-config/quote-validity' },
    { label: 'Terrain', route: '/quote-config/quote-terrain' }
  ];

  constructor(private router: Router) {}

  isActiveTab(route: string): boolean {
    return this.router.url.includes(route);
  }

  navigateToTab(route: string) {
    this.router.navigate([route]);
  }
}