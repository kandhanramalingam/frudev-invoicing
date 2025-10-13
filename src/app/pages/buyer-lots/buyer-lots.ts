import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/header/header';
import { LotService } from '../../core/lot.service';
import { ToastService } from '../../core/toast.service';
import { Button } from 'primeng/button';
import {CurrencyPipe, NgClass} from '@angular/common';
import { BuyerService } from '../../core/buyer.service';

@Component({
  selector: 'app-buyer-lots',
    imports: [HeaderComponent, TableModule, FormsModule, Button, CurrencyPipe, NgClass],
  templateUrl: './buyer-lots.html',
  styleUrl: './buyer-lots.scss'
})
export class BuyerLots implements OnInit {
  buyerId: string | null = null;
  auctionId: number | null = null;
  bidderNo: string | null = null;
  buyerName: string = '';
  lots: any[] = [];
  selectedLots: any[] = [];
  generatedInvoices: any[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lotService: LotService,
    private buyerService: BuyerService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    this.buyerId = this.route.snapshot.queryParamMap.get('buyerId');
    this.auctionId = Number(this.route.snapshot.queryParamMap.get('auctionId'));
    this.bidderNo = this.route.snapshot.queryParamMap.get('bidderNo');
    
    if (this.buyerId && this.auctionId) {
      await this.loadBuyerInfo();
      await this.loadGeneratedInvoices();
      await this.loadBuyerLots();
    }
  }

  async loadBuyerLots() {
    this.loading = true;
    try {
      this.lots = await this.lotService.getBuyerLots(this.buyerId!, this.auctionId!);
    } catch (error) {
      console.error('Error loading buyer lots:', error);
      this.toastService.showError('Failed to load buyer lots');
    } finally {
      this.loading = false;
    }
  }

  async loadBuyerInfo() {
    try {
      const result = await this.buyerService.getBuyers(this.auctionId!, null, { page: 0, size: 1000 });
      const buyer = result.data.find(b => b.buyer_id === this.buyerId);
      if (buyer) {
        this.buyerName = buyer.firstName && buyer.lastName 
          ? `${buyer.firstName} ${buyer.lastName}` 
          : `Buyer ${buyer.buyer_id}`;
      }
    } catch (error) {
      console.error('Error loading buyer info:', error);
    }
  }

  goBack() {
    this.router.navigate(['/buyers'], {
      queryParams: { auctionId: this.auctionId }
    });
  }

  async loadGeneratedInvoices() {
    try {
      // Mock data - replace with actual service call
      this.generatedInvoices = [
        {
          id: 'INV-2024-001',
          date: '2024-01-15',
          total: 25000,
          status: 'Paid'
        },
        {
          id: 'INV-2024-002', 
          date: '2024-01-20',
          total: 18500,
          status: 'Pending'
        }
      ];
    } catch (error) {
      console.error('Error loading generated invoices:', error);
    }
  }

  createInvoice() {
    if (this.selectedLots.length === 0) {
      this.toastService.showError('Please select at least one lot');
      return;
    }
    // TODO: Implement invoice creation
    console.log('Creating invoice for lots:', this.selectedLots);
  }
}