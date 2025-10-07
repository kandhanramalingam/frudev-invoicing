import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-manage',
  imports: [RouterOutlet, NgClass],
  templateUrl: './manage.html',
  styleUrl: './manage.scss'
})
export class Manage {
  tabs = [
    { label: 'Vehicle Types', route: '/manage/vehicle-types' },
    { label: 'Vehicle Categories', route: '/manage/vehicle-categories' }
  ];

  constructor(private router: Router) {}

  isActiveTab(route: string): boolean {
    return this.router.url.includes(route);
  }

  navigateToTab(route: string) {
    this.router.navigate([route]);
  }
}