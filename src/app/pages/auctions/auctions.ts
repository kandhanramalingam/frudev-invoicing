import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { AuctionService } from '../../core/auction.service';
import {DatePipe} from "@angular/common";
import {Auction} from "../../interfaces/auction.interface";
import {RouterLink} from "@angular/router";
import {ToastService} from "../../core/toast.service";

@Component({
  selector: 'app-auctions',
    imports: [HeaderComponent, TableModule, FormsModule, InputText, DatePipe, RouterLink],
  templateUrl: './auctions.html',
  styleUrl: './auctions.scss'
})
export class Auctions implements OnInit {
  rows: Auction[] = [];
  loading = false;
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 0;

  filterDate: string | null = null; // yyyy-mm-dd
  search: string = '';

  constructor(private svc: AuctionService, private toastService: ToastService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      const result = await this.svc.getAuctions(this.filterDate, this.search, {
        page: this.currentPage,
        size: this.rowsPerPage
      });
      this.rows = result.data;
      this.totalRecords = result.totalRecords;
    } catch (err) {
      console.log(err);
      this.toastService.showError('Failed to load auctions');
    } finally {
      this.loading = false;
    }
  }

  onPageChange(event: any) {
    this.currentPage = event.first / event.rows;
    this.rowsPerPage = event.rows;
    this.load();
  }
}
