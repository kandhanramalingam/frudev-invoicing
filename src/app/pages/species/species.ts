import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-species',
  imports: [RouterOutlet, NgClass],
  templateUrl: './species.html',
  styleUrl: './species.scss'
})
export class Species {
  tabs = [
    { label: 'Species', route: '/species/species-list' },
    { label: 'Species Categories', route: '/species/species-categories' }
  ];

  constructor(private router: Router) {}

  isActiveTab(route: string): boolean {
    return this.router.url.includes(route);
  }

  navigateToTab(route: string) {
    this.router.navigate([route]);
  }
}