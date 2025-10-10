import {Component, HostListener, OnInit} from '@angular/core';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';
import {ActivatedRoute, Router} from '@angular/router';
import {HeaderComponent} from "../../shared/header/header";
import {AuctionService} from "../../core/auction.service";
import {LotService} from "../../core/lot.service";
import {Auction} from "../../interfaces/auction.interface";
import {TitleCasePipe} from "@angular/common";
import {Tooltip} from "primeng/tooltip";
import {SampleInvoice} from "../sample-invoice/sample-invoice";
import {InvoiceConfigs, InvoiceLotDetail, LotListItem} from "../../interfaces/lot-response.interface";
import {ToastService} from "../../core/toast.service";
import {ViewChild} from '@angular/core';
import {ConfirmationService} from 'primeng/api';
import {ConfirmDialog} from 'primeng/confirmdialog';

@Component({
    selector: 'app-auction-lots',
    imports: [HeaderComponent, TableModule, FormsModule, Select, InputText, Button, TitleCasePipe, Tooltip, SampleInvoice, ConfirmDialog],
    templateUrl: './lots.html',
    styleUrl: './lots.scss',
    providers: [ConfirmationService]
})
export class AuctionLots implements OnInit {
    auctions: Auction[] = [];
    selectedAuctionId: number | null = null;
    searchLot: string = '';
    rows: LotListItem[] = [];
    loading = false;
    loadingAuctions = false;
    totalRecords = 0;
    rowsPerPage = 10;
    currentPage = 0;
    showInvoiceView = false;
    invoiceConfig: InvoiceConfigs | null = null;
    invoiceLotDetails: InvoiceLotDetail[] = [];
    loadingInvoice = false;
    @ViewChild(SampleInvoice) sampleInvoiceComponent!: SampleInvoice;


    constructor(private auctionSvc: AuctionService, private lotSvc: LotService, private route: ActivatedRoute, private router: Router, private toastService: ToastService, private confirmationService: ConfirmationService) {
    }

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
            this.totalRecords = 0;
            return;
        }
        this.loading = true;
        try {
            const result = await this.lotSvc.getLots(this.selectedAuctionId, this.searchLot, {
                page: this.currentPage,
                size: this.rowsPerPage
            });
            this.rows = result.data;
            this.totalRecords = result.totalRecords;
        } finally {
            this.loading = false;
        }
    }

    onPageChange(event: any) {
        this.currentPage = event.first / event.rows;
        this.rowsPerPage = event.rows;
        this.load();
    }

    showInvoice(lot: LotListItem) {
        this.loadingInvoice = true;
        this.lotSvc.getInvoiceDetailsFromLot(lot)
            .then((response) => {
                this.invoiceConfig = response.configs;
                this.invoiceLotDetails = response.lotDetails;
                this.showInvoiceView = true;
            })
            .catch(err => {
                console.log(err);
                this.toastService.showError('Failed to load invoice details');
            })
            .finally(() => {
                this.loadingInvoice = false;
            });
    }

    hideInvoice() {
        this.showInvoiceView = false;
    }

    printInvoice() {
        const hasExpenses = this.sampleInvoiceComponent?.expenses?.length > 0;
        
        if (!hasExpenses) {
            this.confirmationService.confirm({
                message: 'You haven’t added any expenses. Do you want to continue printing?',
                header: 'No Expenses Added',
                icon: 'pi pi-exclamation-triangle',
                rejectButtonStyleClass: 'p-button-secondary',
                acceptButtonStyleClass: 'p-button-primary',
                accept: () => {
                    setTimeout(() => {
                        window.print();
                    }, 100);
                }
            });
        } else {
            window.print();
        }
    }

    createQuote(lot: LotListItem) {
        this.router.navigate(['/quote/quote-wrapper'], {
            queryParams: { lotId: lot.id }
        });
    }

    @HostListener('document:keydown.escape')
    onEscapeKey() {
        if (this.showInvoiceView) {
            this.hideInvoice();
        }
    }
}
