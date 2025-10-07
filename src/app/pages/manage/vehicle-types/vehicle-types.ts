import { Component, OnInit } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { VehicleTypeService, VehicleType } from '../../../core/vehicle-type.service';
import { HeaderComponent } from '../../../shared/header/header';
import { TableModule } from "primeng/table";
import { ToastService } from '../../../core/toast.service';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-vehicle-types',
    imports: [Menu, HeaderComponent, TableModule, Button, Drawer, InputText, FormsModule, ConfirmDialog, NgClass],
  providers: [ConfirmationService],
  templateUrl: './vehicle-types.html',
  styleUrl: './vehicle-types.scss'
})
export class VehicleTypes implements OnInit {
  vehicleTypes: VehicleType[] = [];
  filteredTypes: VehicleType[] = [];
  loading = false;
  drawerVisible = false;
  newVehicleTypeName = '';
  saving = false;
  editingVehicleType: VehicleType | null = null;
  selectedType: VehicleType | null = null;
  searchTerm = '';
  actionMenus: MenuItem[] = [
      {label: 'Edit', icon: 'fa fa-pencil', command: () => this.editVehicleType(this.selectedType)},
      {label: 'Delete', styleClass: 'text-red-600', icon: 'fa fa-trash', command: () => this.confirmDelete(this.selectedType)}
  ];
  constructor(
    private vehicleTypeService: VehicleTypeService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      this.vehicleTypes = await this.vehicleTypeService.getAll();
      this.filterTypes();
    } catch (error) {
      this.toastService.showError('Failed to load vehicle types');
    } finally {
      this.loading = false;
    }
  }

  filterTypes() {
    if (!this.searchTerm) {
      this.filteredTypes = [...this.vehicleTypes];
    } else {
      this.filteredTypes = this.vehicleTypes.filter(type =>
        type.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  ngAfterViewInit() {
    // Watch for search term changes
    const searchInput = document.querySelector('input[placeholder="Search types"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.filterTypes();
      });
    }
  }

  openDrawer() {
    this.editingVehicleType = null;
    this.drawerVisible = true;
    this.newVehicleTypeName = '';
  }

  editVehicleType(vehicleType: VehicleType | null) {
      if (!vehicleType) {
          return;
      }
    this.editingVehicleType = vehicleType;
    this.newVehicleTypeName = vehicleType.name;
    this.drawerVisible = true;
  }

  async saveVehicleType() {
    if (!this.newVehicleTypeName.trim()) return;
    
    this.saving = true;
    try {
      if (this.editingVehicleType) {
        await this.vehicleTypeService.update(this.editingVehicleType.id, this.newVehicleTypeName.trim());
        this.toastService.showSuccess('Vehicle type updated successfully');
      } else {
        await this.vehicleTypeService.create(this.newVehicleTypeName.trim());
        this.toastService.showSuccess('Vehicle type added successfully');
      }
      this.drawerVisible = false;
      await this.load();
    } catch (error) {
      this.toastService.showError(this.editingVehicleType ? 'Failed to update vehicle type' : 'Failed to add vehicle type');
    } finally {
      this.saving = false;
    }
  }

  confirmDelete(vehicleType: VehicleType | null) {
      if (!vehicleType) {
          return;
      }
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${vehicleType.name}"?`,
      header: 'Delete Confirmation',
      icon: 'fa fa-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteVehicleType(vehicleType.id)
    });
  }

  async deleteVehicleType(id: number) {
    try {
      await this.vehicleTypeService.delete(id);
      this.toastService.showSuccess('Vehicle type deleted successfully');
      await this.load();
    } catch (error) {
      this.toastService.showError('Failed to delete vehicle type');
    }
  }
}