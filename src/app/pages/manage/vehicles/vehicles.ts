import { Component, OnInit } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { VehicleService, Vehicle } from '../../../core/vehicle.service';
import { HeaderComponent } from '../../../shared/header/header';
import { TableModule } from "primeng/table";
import { ToastService } from '../../../core/toast.service';
import {CurrencyPipe, NgClass} from '@angular/common';
import { InputText } from 'primeng/inputtext';
import {Ripple} from "primeng/ripple";

@Component({
  selector: 'app-vehicles',
    imports: [Menu, HeaderComponent, TableModule, Button, Drawer, ConfirmDialog, FormsModule, NgClass, InputText, CurrencyPipe, Ripple],
  providers: [ConfirmationService],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss'
})
export class Vehicles implements OnInit {
  vehicles: Vehicle[] = [];
  loading = false;
  selectedVehicle: Vehicle | null = null;
  searchTerm = '';
  drawerVisible = false;
  saving = false;
  editingVehicle: Vehicle | null = null;
  vehicleForm = {
    make: '',
    year: new Date().getFullYear(),
    type: '',
    code: '',
    registrationNumber: '',
    rate: 0,
    active: true
  };

  constructor(
    private vehicleService: VehicleService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  getMenuItems(vehicle: Vehicle): MenuItem[] {
    return [
      {
        label: 'Edit',
        icon: 'fa fa-pencil',
        command: () => this.editVehicle(vehicle)
      },
      {
        label: vehicle.active ? 'Deactivate' : 'Activate',
        icon: vehicle.active ? 'fa fa-ban' : 'fa fa-check',
        styleClass: vehicle.active ? 'text-red-600' : 'text-green-600',
        command: () => this.confirmStatusChange(vehicle)
      },
      {
        label: 'Delete',
        icon: 'fa fa-trash',
        styleClass: 'text-red-600',
        command: () => this.confirmDelete(vehicle)
      }
    ];
  }

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      this.vehicles = await this.vehicleService.getAll(this.searchTerm || undefined);
    } catch (error) {
      this.toastService.showError('Failed to load vehicles');
    } finally {
      this.loading = false;
    }
  }

  confirmStatusChange(vehicle: Vehicle) {
    const action = vehicle.active ? 'deactivate' : 'activate';
    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} "${vehicle.make}"?`,
      header: 'Status Change Confirmation',
      icon: 'fa fa-exclamation-triangle',
      acceptButtonStyleClass: vehicle.active ? 'p-button-danger' : 'p-button-success',
      accept: () => this.updateVehicleStatus(vehicle.id, !vehicle.active)
    });
  }

  openDrawer() {
    this.editingVehicle = null;
    this.drawerVisible = true;
    this.resetForm();
  }

  editVehicle(vehicle: Vehicle) {
    this.editingVehicle = vehicle;
    this.vehicleForm = {
      make: vehicle.make,
      year: vehicle.year,
      type: vehicle.type,
      code: vehicle.code,
      registrationNumber: vehicle.registrationNumber,
      rate: vehicle.rate,
      active: vehicle.active
    };
    this.drawerVisible = true;
  }

  resetForm() {
    this.vehicleForm = {
      make: '',
      year: new Date().getFullYear(),
      type: '',
      code: '',
      registrationNumber: '',
      rate: 0,
      active: true
    };
  }

  isFormValid(): boolean {
    return !!(this.vehicleForm.make && this.vehicleForm.type && this.vehicleForm.code);
  }

  async saveVehicle() {
    if (!this.isFormValid()) return;
    
    this.saving = true;
    try {
      if (this.editingVehicle) {
        await this.vehicleService.update(this.editingVehicle.id, this.vehicleForm);
        this.toastService.showSuccess('Vehicle updated successfully');
      } else {
        await this.vehicleService.create(this.vehicleForm);
        this.toastService.showSuccess('Vehicle added successfully');
      }
      this.drawerVisible = false;
      await this.load();
    } catch (error) {
      this.toastService.showError(this.editingVehicle ? 'Failed to update vehicle' : 'Failed to add vehicle');
    } finally {
      this.saving = false;
    }
  }

  confirmDelete(vehicle: Vehicle) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${vehicle.make}"?`,
      header: 'Delete Confirmation',
      icon: 'fa fa-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteVehicle(vehicle.id)
    });
  }

  async deleteVehicle(id: number) {
    try {
      await this.vehicleService.delete(id);
      this.toastService.showSuccess('Vehicle deleted successfully');
      await this.load();
    } catch (error) {
      this.toastService.showError('Failed to delete vehicle');
    }
  }

  clearValidations() {
    // Clear form validation states when drawer closes
    setTimeout(() => {
      const inputs = document.querySelectorAll('p-drawer input');
      inputs.forEach((input: any) => {
        input.classList.remove('ng-invalid', 'ng-touched');
      });
    }, 100);
  }

  async updateVehicleStatus(id: number, active: boolean) {
    try {
      await this.vehicleService.updateStatus(id, active);
      this.toastService.showSuccess(`Vehicle ${active ? 'activated' : 'deactivated'} successfully`);
      await this.load();
    } catch (error) {
      this.toastService.showError('Failed to update vehicle status');
    }
  }
}