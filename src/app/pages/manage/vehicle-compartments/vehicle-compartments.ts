import { Component, OnInit } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { VehicleCompartmentService, VehicleCompartment } from '../../../core/vehicle-compartment.service';
import { HeaderComponent } from '../../../shared/header/header';
import { TableModule } from "primeng/table";
import { ToastService } from '../../../core/toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-vehicle-compartments',
  imports: [Menu, HeaderComponent, TableModule, Button, Drawer, InputText, FormsModule, ConfirmDialog, NgClass],
  providers: [ConfirmationService],
  templateUrl: './vehicle-compartments.html',
  styleUrl: './vehicle-compartments.scss'
})
export class VehicleCompartments implements OnInit {
  vehicleCompartments: VehicleCompartment[] = [];
  loading = false;
  drawerVisible = false;
  newVehicleCompartmentName = '';
  saving = false;
  editingVehicleCompartment: VehicleCompartment | null = null;
  selectedCompartment: VehicleCompartment | null = null;
  searchTerm = '';
  actionMenus: MenuItem[] = [
    {label: 'Edit', icon: 'fa fa-pencil', command: () => this.editVehicleCompartment(this.selectedCompartment)},
    {label: 'Delete', styleClass: 'text-red-600', icon: 'fa fa-trash', command: () => this.confirmDelete(this.selectedCompartment)}
  ];

  constructor(
    private vehicleCompartmentService: VehicleCompartmentService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      this.vehicleCompartments = await this.vehicleCompartmentService.getAll(this.searchTerm || undefined);
    } catch (error) {
      this.toastService.showError('Failed to load vehicle compartments');
    } finally {
      this.loading = false;
    }
  }

  openDrawer() {
    this.editingVehicleCompartment = null;
    this.drawerVisible = true;
    this.newVehicleCompartmentName = '';
  }

  editVehicleCompartment(vehicleCompartment: VehicleCompartment | null) {
    if (!vehicleCompartment) {
      return;
    }
    this.editingVehicleCompartment = vehicleCompartment;
    this.newVehicleCompartmentName = vehicleCompartment.name;
    this.drawerVisible = true;
  }

  async saveVehicleCompartment() {
    if (!this.newVehicleCompartmentName.trim()) return;
    
    this.saving = true;
    try {
      if (this.editingVehicleCompartment) {
        await this.vehicleCompartmentService.update(this.editingVehicleCompartment.id, this.newVehicleCompartmentName.trim());
        this.toastService.showSuccess('Vehicle compartment updated successfully');
      } else {
        await this.vehicleCompartmentService.create(this.newVehicleCompartmentName.trim());
        this.toastService.showSuccess('Vehicle compartment added successfully');
      }
      this.drawerVisible = false;
      await this.load();
    } catch (error) {
      this.toastService.showError(this.editingVehicleCompartment ? 'Failed to update vehicle compartment' : 'Failed to add vehicle compartment');
    } finally {
      this.saving = false;
    }
  }

  confirmDelete(vehicleCompartment: VehicleCompartment | null) {
    if (!vehicleCompartment) {
      return;
    }
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${vehicleCompartment.name}"?`,
      header: 'Delete Confirmation',
      icon: 'fa fa-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteVehicleCompartment(vehicleCompartment.id)
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

  async deleteVehicleCompartment(id: number) {
    try {
      await this.vehicleCompartmentService.delete(id);
      this.toastService.showSuccess('Vehicle compartment deleted successfully');
      await this.load();
    } catch (error) {
      this.toastService.showError('Failed to delete vehicle compartment');
    }
  }
}