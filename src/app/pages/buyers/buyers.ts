import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { ActivatedRoute } from '@angular/router';
import {HeaderComponent} from "../../shared/header/header";
import {AuctionService} from "../../core/auction.service";
import {BuyerService} from "../../core/buyer.service";
import {Auction} from "../../interfaces/auction.interface";
import {Buyer} from "../../interfaces/buyer.interface";
import {Tooltip} from "primeng/tooltip";
import {CurrencyPipe} from "@angular/common";
import {ToastService} from "../../core/toast.service";

@Component({
  selector: 'app-auction-buyers',
    imports: [HeaderComponent, TableModule, FormsModule, Select, InputText, Tooltip, CurrencyPipe],
  templateUrl: './buyers.html',
  styleUrl: './buyers.scss'
})
export class AuctionBuyers implements OnInit {
  auctions: Auction[] = [];
  selectedAuctionId: number | null = null;
  searchName: string = '';
  rows: Buyer[] = [];
  loading = false;
  loadingAuctions = false;
  rowsPerPage = 10;

  constructor(private auctionSvc: AuctionService, private buyerSvc: BuyerService, private route: ActivatedRoute, private toastService: ToastService) {}

  async ngOnInit() {
    this.auctions = await this.auctionSvc.searchAuctions();
    const auctionId = this.route.snapshot.queryParamMap.get('auctionId');
    this.selectedAuctionId = auctionId ? Number(auctionId) : null;
    if (this.selectedAuctionId) {
      await this.load();
    }
  }

  async onFilter(event: any) {
    this.loadingAuctions = true;
    this.auctions = await this.auctionSvc.searchAuctions(event.filter);
    this.loadingAuctions = false;
  }

  async load() {
    if (!this.selectedAuctionId) {
      this.rows = [];
      return;
    }
    this.loading = true;
    try {
      this.rows = await this.buyerSvc.getBuyers(this.selectedAuctionId, this.searchName);
    } catch (err) {
      console.log(err);
      this.toastService.showError('Failed to load buyers');
    } finally {
      this.loading = false;
    }
  }
}
