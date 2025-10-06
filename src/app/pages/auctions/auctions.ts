import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { AuctionService } from '../../core/auction.service';
import {DatePipe} from "@angular/common";
import {Auction} from "../../interfaces/auction.interface";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-auctions',
    imports: [HeaderComponent, TableModule, FormsModule, InputText, DatePipe, RouterLink],
  templateUrl: './auctions.html',
  styleUrl: './auctions.scss'
})
export class Auctions implements OnInit {
  rows: Auction[] = [];
  loading = false;
  rowsPerPage = 10;

  filterDate: string | null = null; // yyyy-mm-dd
  search: string = '';

  constructor(private svc: AuctionService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      this.rows = await this.svc.getAuctions(this.filterDate, this.search);
    } finally {
      this.loading = false;
    }
  }

  clearFilters() {
    this.filterDate = null;
    this.search = '';
    this.load();
  }
}
