import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Drawer } from 'primeng/drawer';
import { Menu } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/client.service';
import { ToastService } from '../../../core/toast.service';
import { HeaderComponent } from "../../../shared/header/header";
import { MenuItem, ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { NgClass } from "@angular/common";
import { Ripple } from "primeng/ripple";
import { Client } from '../../../interfaces/client.interface';

@Component({
  selector: 'app-clients-list',
  imports: [TableModule, Button, InputText, Textarea, Select, Drawer, Menu, ConfirmDialog, FormsModule, HeaderComponent, NgClass, Ripple],
  providers: [ConfirmationService],
  templateUrl: './clients-list.html',
  styleUrl: './clients-list.scss'
})
export class ClientsList implements OnInit {
  clients: Client[] = [];
  loading = false;
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 0;
  drawerVisible = false;
  editMode = false;
  currentClient: Client = { firstName: '', lastName: '', email: '', address: '', mobile: '', status: 'Y' };
  selectedClient: Client | null = null;
  searchTerm = '';
  statusOptions = [
    { label: 'Active', value: 'Y' },
    { label: 'Inactive', value: 'N' }
  ];

  constructor(
    private clientService: ClientService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const result = await this.clientService.getClients(this.searchTerm, {
        page: this.currentPage,
        size: this.rowsPerPage
      });
      this.clients = result.data;
      this.totalRecords = result.totalRecords;
    } catch (error) {
      console.log(error);
      this.toastService.showError('Failed to load data');
    } finally {
      this.loading = false;
    }
  }

  onPageChange(event: any) {
    this.currentPage = event.first / event.rows;
    this.rowsPerPage = event.rows;
    this.loadData();
  }

  openDrawer(client?: Client) {
    this.editMode = !!client;
    this.currentClient = client ? { ...client } : { firstName: '', lastName: '', email: '', address: '', mobile: '', status: 'Y' };
    this.drawerVisible = true;
  }

  async saveClient() {
    try {
      if (this.editMode) {
        await this.clientService.updateClient(this.currentClient);
        this.toastService.showSuccess('Client updated successfully');
      } else {
        await this.clientService.createClient(this.currentClient);
        this.toastService.showSuccess('Client created successfully');
      }
      await this.loadData();
      this.drawerVisible = false;
    } catch (error) {
      this.toastService.showError('Failed to save client');
    }
  }

  confirmDelete(client: Client) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${client.firstName} ${client.lastName}"?`,
      header: 'Delete Confirmation',
      icon: 'fa fa-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.deleteClient(client)
    });
  }

  async deleteClient(client: Client) {
    try {
      await this.clientService.deleteClient(client.id!);
      this.toastService.showSuccess('Client deleted successfully');
      await this.loadData();
    } catch (error) {
      this.toastService.showError('Failed to delete client');
    }
  }

  getMenuItems(client: Client): MenuItem[] {
    return [
      {
        label: 'Edit',
        icon: 'fa fa-pencil',
        command: () => this.openDrawer(client)
      },
      {
        label: 'Delete',
        icon: 'fa fa-trash',
        styleClass: 'text-red-600',
        command: () => this.confirmDelete(client)
      }
    ];
  }
}