import { Component, OnInit } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { QuoteValidityService } from '../../../core/quote-validity.service';
import { QuoteValidity } from '../../../interfaces/quote-validity.interface';
import { HeaderComponent } from '../../../shared/header/header';
import { TableModule } from "primeng/table";
import { ToastService } from '../../../core/toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-quote-validity',
  imports: [Menu, HeaderComponent, TableModule, Button, Drawer, InputText, FormsModule, ConfirmDialog, NgClass],
  providers: [ConfirmationService],
  templateUrl: './quote-validity.html',
  styleUrl: './quote-validity.scss'
})
export class QuoteValidityComponent implements OnInit {
  quoteValidities: QuoteValidity[] = [];
  loading = false;
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 0;
  drawerVisible = false;
  newValidityDays: number | null = null;
  saving = false;
  editingValidity: QuoteValidity | null = null;
  selectedValidity: QuoteValidity | null = null;
  searchTerm = '';
  actionMenus: MenuItem[] = [
    {label: 'Edit', icon: 'fa fa-pencil', command: () => this.editValidity(this.selectedValidity)},
    {label: 'Delete', styleClass: 'text-red-600', icon: 'fa fa-trash', command: () => this.confirmDelete(this.selectedValidity)}
  ];

  constructor(
    private quoteValidityService: QuoteValidityService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      const result = await this.quoteValidityService.getAll(this.searchTerm || undefined, {
        page: this.currentPage,
        size: this.rowsPerPage
      });
      this.quoteValidities = result.data;
      this.totalRecords = result.totalRecords;
    } catch (error) {
      this.toastService.showError('Failed to load quote validity');
    } finally {
      this.loading = false;
    }
  }

  onPageChange(event: any) {
    this.currentPage = event.first / event.rows;
    this.rowsPerPage = event.rows;
    this.load();
  }

  openDrawer() {
    this.editingValidity = null;
    this.drawerVisible = true;
    this.newValidityDays = null;
  }

  editValidity(validity: QuoteValidity | null) {
      if (!validity) {
          return;
      }
    this.editingValidity = validity;
    this.newValidityDays = validity.days;
    this.drawerVisible = true;
  }

  async saveValidity() {
    if (!this.newValidityDays || this.newValidityDays <= 0) return;
    
    this.saving = true;
    try {
      if (this.editingValidity) {
        await this.quoteValidityService.update(this.editingValidity.id, this.newValidityDays);
        this.toastService.showSuccess('Quote validity updated successfully');
      } else {
        await this.quoteValidityService.create(this.newValidityDays);
        this.toastService.showSuccess('Quote validity added successfully');
      }
      this.drawerVisible = false;
      await this.load();
    } catch (error) {
      this.toastService.showError(this.editingValidity ? 'Failed to update quote validity' : 'Failed to add quote validity');
    } finally {
      this.saving = false;
    }
  }

  confirmDelete(validity: QuoteValidity | null) {
      if (!validity) {
          return;
      }
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${validity.days} days"?`,
      header: 'Delete Confirmation',
      icon: 'fa fa-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger', rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.deleteValidity(validity.id)
    });
  }

  clearValidations() {
    setTimeout(() => {
      const inputs = document.querySelectorAll('p-drawer input');
      inputs.forEach((input: any) => {
        input.classList.remove('ng-invalid', 'ng-touched');
      });
    }, 100);
  }

  async deleteValidity(id: number) {
    try {
      await this.quoteValidityService.delete(id);
      this.toastService.showSuccess('Quote validity deleted successfully');
      await this.load();
    } catch (error) {
      this.toastService.showError('Failed to delete quote validity');
    }
  }
}