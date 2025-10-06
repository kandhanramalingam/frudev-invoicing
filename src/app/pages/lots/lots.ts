import {Component, HostListener, OnInit} from '@angular/core';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';
import {ActivatedRoute} from '@angular/router';
import {HeaderComponent} from "../../shared/header/header";
import {AuctionService} from "../../core/auction.service";
import {LotService} from "../../core/lot.service";
import {Auction} from "../../interfaces/auction.interface";
import {TitleCasePipe} from "@angular/common";
import {Tooltip} from "primeng/tooltip";
import {SampleInvoice} from "../sample-invoice/sample-invoice";
import {InvoiceConfigs, InvoiceLotDetail, LotListItem} from "../../interfaces/lot-response.interface";
import {ToastService} from "../../core/toast.service";

@Component({
    selector: 'app-auction-lots',
    imports: [HeaderComponent, TableModule, FormsModule, Select, InputText, Button, TitleCasePipe, Tooltip, SampleInvoice],
    templateUrl: './lots.html',
    styleUrl: './lots.scss'
})
export class AuctionLots implements OnInit {
    auctions: Auction[] = [];
    selectedAuctionId: number | null = null;
    searchLot: string = '';
    rows: LotListItem[] = [];
    loading = false;
    loadingAuctions = false;
    rowsPerPage = 10;
    showInvoiceView = false;
    invoiceConfig: InvoiceConfigs | null = null;
    invoiceLotDetails: InvoiceLotDetail[] = [];
    loadingInvoice = false;


    constructor(private auctionSvc: AuctionService, private lotSvc: LotService, private route: ActivatedRoute, private toastService: ToastService) {
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
            return;
        }
        this.loading = true;
        try {
            this.rows = await this.lotSvc.getLots(this.selectedAuctionId, this.searchLot);
        } finally {
            this.loading = false;
        }
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
        window.print();
    }

    @HostListener('document:keydown.escape')
    onEscapeKey() {
        if (this.showInvoiceView) {
            this.hideInvoice();
        }
    }
}
