import {Component, OnInit} from '@angular/core';
import {TableModule} from 'primeng/table';
import {FormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {HeaderComponent} from "../../shared/header/header";
import {AuctionService} from "../../core/auction.service";
import {LotService} from "../../core/lot.service";
import {Auction} from "../../interfaces/auction.interface";
import {Lot} from "../../interfaces/lot.interface";
import {TitleCasePipe} from "@angular/common";
import {SampleInvoice} from "../sample-invoice/sample-invoice";
import {Tooltip} from "primeng/tooltip";
import {InvoiceConfigs, InvoiceLotDetail, LotListItem} from "../../interfaces/lot-response.interface";

@Component({
    selector: 'app-auction-lots',
    imports: [HeaderComponent, TableModule, FormsModule, Select, InputText, Button, Dialog, TitleCasePipe, SampleInvoice, Tooltip],
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
    showInvoiceModal = false;
    selectedLot: LotListItem | null = null;
    invoiceConfig: InvoiceConfigs | null = null;
    invoiceLotDetails: InvoiceLotDetail[] = [];

    constructor(private auctionSvc: AuctionService, private lotSvc: LotService, private route: ActivatedRoute, private router: Router) {
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
        this.selectedLot = lot;
        this.lotSvc.getInvoiceDetailsFromLot(lot)
            .then((response) => {
                this.invoiceConfig = response.configs;
                this.invoiceLotDetails = response.lotDetails;
                this.showInvoiceModal = true;
            })
            .catch(err => {console.log(err)});
    }
}
