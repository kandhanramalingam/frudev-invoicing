import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/header/header';
import { LotService } from '../../core/lot.service';
import { ToastService } from '../../core/toast.service';
import { Button } from 'primeng/button';
import {CurrencyPipe, DatePipe, NgClass} from '@angular/common';
import { BuyerService } from '../../core/buyer.service';
import { SampleInvoice } from '../sample-invoice/sample-invoice';
import { InvoiceConfigs, InvoiceLotDetail } from '../../interfaces/lot-response.interface';
import { InvoiceService, GeneratedInvoice } from '../../core/invoice.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Drawer } from 'primeng/drawer';

@Component({
  selector: 'app-buyer-lots',
    imports: [HeaderComponent, TableModule, FormsModule, Button, CurrencyPipe, DatePipe, NgClass, SampleInvoice, ConfirmDialog, Drawer],
  providers: [ConfirmationService],
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
  selectableRows: any[] = [];
  generatedInvoices: GeneratedInvoice[] = [];
  invoicedLotNumbers: string[] = [];
  loading = false;
  loadingInvoice = false;
  showInvoiceView = false;
  showInvoiceDrawer = false;
  currentInvoiceContent = '';
  invoiceConfig: InvoiceConfigs | null = null;
  invoiceLotDetails: InvoiceLotDetail[] = [];
  @ViewChild(SampleInvoice) sampleInvoiceComponent!: SampleInvoice;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lotService: LotService,
    private buyerService: BuyerService,
    private toastService: ToastService,
    private invoiceService: InvoiceService,
    private confirmationService: ConfirmationService
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
      // Mark lots as invoiced if they exist in invoiced lot numbers
      this.lots = this.lots.map(lot => ({
        ...lot,
        isInvoiced: this.invoicedLotNumbers.includes(lot.mainlotno)
      }));
      // Create selectableRows array with only non-invoiced lots
      this.selectableRows = this.lots.filter(lot => !lot.isInvoiced);
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
      this.generatedInvoices = await this.invoiceService.getGeneratedInvoices(this.auctionId!, this.buyerId!);
      this.invoicedLotNumbers = await this.invoiceService.getInvoicedLotNumbers(this.auctionId!, this.buyerId!);
    } catch (error) {
      console.error('Error loading generated invoices:', error);
    }
  }

  async createInvoice() {
    if (this.selectedLots.length === 0) {
      this.toastService.showError('Please select at least one lot');
      return;
    }
    
    this.loadingInvoice = true;
    try {
      // Get invoice configs
      const configs = await this.lotService.getInvoiceConfigs();
      this.invoiceConfig = configs;
      
      // Convert selected lots to invoice format
      this.invoiceLotDetails = this.selectedLots.map(lot => ({
        Lot: lot.mainlotno,
        Buyer: Number(this.bidderNo) || 0,
        Item: lot.description,
        M: lot.male_total || 0,
        F: lot.female_total || 0,
        T: lot.sum_total,
        Amount: parseFloat(lot.auction_price) || 0,
        Total: parseFloat(lot.total_auction_price) || 0,
        Vat: 0
      }));
      
      this.showInvoiceView = true;
    } catch (error) {
      console.error('Error creating invoice preview:', error);
      this.toastService.showError('Failed to create invoice preview');
    } finally {
      this.loadingInvoice = false;
    }
  }

  hideInvoice() {
    this.showInvoiceView = false;
    this.selectedLots = [];
  }



  async saveAndPrintInvoice() {
    if (!this.sampleInvoiceComponent) {
      this.toastService.showError('Invoice component not ready');
      return;
    }

    try {
      const pdfContent = await this.sampleInvoiceComponent.generatePDFContent();
      const lotNumbers = this.selectedLots.map(lot => lot.mainlotno).join(',');
      const totalAmount = this.selectedLots.reduce((sum, lot) => sum + parseFloat(lot.total_auction_price || '0'), 0);
      
      const invoiceNumber = await this.invoiceService.saveInvoice({
        auction_id: this.auctionId!,
        buyer_id: this.buyerId!,
        lot_numbers: lotNumbers,
        total_amount: totalAmount,
        invoice_file: pdfContent,
        file_name: `invoice_${Date.now()}.pdf`
      });
      
      this.toastService.showSuccess(`Invoice ${invoiceNumber} saved successfully`);
      
      // Show print preview after successful save
      window.print();
      
      this.hideInvoice();
      
      // Refresh data
      await this.loadGeneratedInvoices();
      await this.loadBuyerLots();
      this.selectedLots = [];
    } catch (error) {
      console.error('Error saving invoice:', error);
      this.toastService.showError('Failed to save invoice');
      // Don't show preview on error
    }
  }

  confirmDeleteInvoice(invoiceNumber: string) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete invoice "${invoiceNumber}"?`,
      header: 'Delete Confirmation',
      icon: 'fa fa-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.deleteInvoice(invoiceNumber)
    });
  }

  async deleteInvoice(invoiceNumber: string) {
    try {
      await this.invoiceService.deleteInvoice(invoiceNumber);
      this.toastService.showSuccess('Invoice deleted successfully');
      
      // Refresh data
      await this.loadGeneratedInvoices();
      await this.loadBuyerLots();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      this.toastService.showError('Failed to delete invoice');
    }
  }

  printInvoiceFromList(invoice: GeneratedInvoice) {
    try {
      let htmlContent: string;
      
      if (Array.isArray(invoice.invoice_file)) {
        const uint8Array = new Uint8Array(invoice.invoice_file);
        htmlContent = new TextDecoder().decode(uint8Array);
      } else if (invoice.invoice_file instanceof Uint8Array) {
        htmlContent = new TextDecoder().decode(invoice.invoice_file);
      } else {
        htmlContent = String(invoice.invoice_file);
      }
      
      this.currentInvoiceContent = htmlContent;
      this.showInvoiceDrawer = true;
    } catch (error) {
      console.error('Error loading invoice:', error);
      this.toastService.showError('Failed to load invoice');
    }
  }

  printCurrentInvoice() {
    const printContent = document.getElementById('invoicePreviewContent');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(this.currentInvoiceContent);
        printWindow.document.close();
        printWindow.print();
      } else {
        // Fallback: use browser's print function
        window.print();
      }
    }
  }

  closeInvoiceDrawer() {
    this.showInvoiceDrawer = false;
    this.currentInvoiceContent = '';
  }

  onSelectAll(event: any) {
    if (event.checked) {
      // Select only non-invoiced lots
      this.selectedLots = this.selectableRows;
    } else {
      // Deselect all
      this.selectedLots = [];
    }
  }

  formatDate(dateString: string): Date {
    // Convert "2025-10-14 6:34:50.0 +00:00:00" to valid Date
    const cleanDate = dateString.replace(/\s\+\d{2}:\d{2}:\d{2}$/, '');
    return new Date(cleanDate);
  }
}