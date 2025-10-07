import { Component, OnInit } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { VehicleCategoryService, VehicleCategory } from '../../../core/vehicle-category.service';
import { HeaderComponent } from '../../../shared/header/header';
import { TableModule } from "primeng/table";
import { ToastService } from '../../../core/toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-vehicle-categories',
  imports: [Menu, HeaderComponent, TableModule, Button, Drawer, InputText, FormsModule, ConfirmDialog, NgClass],
  providers: [ConfirmationService],
  templateUrl: './vehicle-categories.html',
  styleUrl: './vehicle-categories.scss'
})
export class VehicleCategories implements OnInit {
  vehicleCategories: VehicleCategory[] = [];
  loading = false;
  drawerVisible = false;
  newVehicleCategoryName = '';
  saving = false;
  editingVehicleCategory: VehicleCategory | null = null;
  selectedCategory: VehicleCategory | null = null;
  searchTerm = '';
  actionMenus: MenuItem[] = [
    {label: 'Edit', icon: 'fa fa-pencil', command: () => this.editVehicleCategory(this.selectedCategory)},
    {label: 'Delete', styleClass: 'text-red-600', icon: 'fa fa-trash', command: () => this.confirmDelete(this.selectedCategory)}
  ];

  constructor(
    private vehicleCategoryService: VehicleCategoryService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      this.vehicleCategories = await this.vehicleCategoryService.getAll(this.searchTerm || undefined);
    } catch (error) {
      this.toastService.showError('Failed to load vehicle categories');
    } finally {
      this.loading = false;
    }
  }

  openDrawer() {
    this.editingVehicleCategory = null;
    this.drawerVisible = true;
    this.newVehicleCategoryName = '';
  }

  editVehicleCategory(vehicleCategory: VehicleCategory | null) {
      if (!vehicleCategory) {
          return;
      }
    this.editingVehicleCategory = vehicleCategory;
    this.newVehicleCategoryName = vehicleCategory.name;
    this.drawerVisible = true;
  }

  async saveVehicleCategory() {
    if (!this.newVehicleCategoryName.trim()) return;
    
    this.saving = true;
    try {
      if (this.editingVehicleCategory) {
        await this.vehicleCategoryService.update(this.editingVehicleCategory.id, this.newVehicleCategoryName.trim());
        this.toastService.showSuccess('Vehicle category updated successfully');
      } else {
        await this.vehicleCategoryService.create(this.newVehicleCategoryName.trim());
        this.toastService.showSuccess('Vehicle category added successfully');
      }
      this.drawerVisible = false;
      await this.load();
    } catch (error) {
      this.toastService.showError(this.editingVehicleCategory ? 'Failed to update vehicle category' : 'Failed to add vehicle category');
    } finally {
      this.saving = false;
    }
  }

  confirmDelete(vehicleCategory: VehicleCategory | null) {
      if (!vehicleCategory) {
          return;
      }
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${vehicleCategory.name}"?`,
      header: 'Delete Confirmation',
      icon: 'fa fa-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteVehicleCategory(vehicleCategory.id)
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

  async deleteVehicleCategory(id: number) {
    try {
      await this.vehicleCategoryService.delete(id);
      this.toastService.showSuccess('Vehicle category deleted successfully');
      await this.load();
    } catch (error) {
      this.toastService.showError('Failed to delete vehicle category');
    }
  }
}