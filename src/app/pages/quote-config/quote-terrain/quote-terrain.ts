import { Component, OnInit } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { QuoteTerrainService } from '../../../core/quote-terrain.service';
import { QuoteTerrain } from '../../../interfaces/quote-terrain.interface';
import { HeaderComponent } from '../../../shared/header/header';
import { TableModule } from "primeng/table";
import { ToastService } from '../../../core/toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-quote-terrain',
  imports: [Menu, HeaderComponent, TableModule, Button, Drawer, InputText, FormsModule, ConfirmDialog, NgClass],
  providers: [ConfirmationService],
  templateUrl: './quote-terrain.html',
  styleUrl: './quote-terrain.scss'
})
export class QuoteTerrainComponent implements OnInit {
  terrains: QuoteTerrain[] = [];
  loading = false;
  totalRecords = 0;
  rowsPerPage = 10;
  currentPage = 0;
  drawerVisible = false;
  saving = false;
  editingTerrain: QuoteTerrain | null = null;
  selectedTerrain: QuoteTerrain | null = null;
  searchTerm = '';
  terrainForm = { name: '', value: 0, animal_per_day: 0 };
  actionMenus: MenuItem[] = [
    {label: 'Edit', icon: 'fa fa-pencil', command: () => this.editTerrain(this.selectedTerrain)},
    {label: 'Delete', styleClass: 'text-red-600', icon: 'fa fa-trash', command: () => this.confirmDelete(this.selectedTerrain)}
  ];

  constructor(
    private quoteTerrainService: QuoteTerrainService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    try {
      const result = await this.quoteTerrainService.getAll(this.searchTerm || undefined, {
        page: this.currentPage,
        size: this.rowsPerPage
      });
      this.terrains = result.data;
      this.totalRecords = result.totalRecords;
    } catch (error) {
      this.toastService.showError('Failed to load terrain');
    } finally {
      this.loading = false;
    }
  }

  async search() {
    this.currentPage = 0;
    await this.load();
  }

  onPageChange(event: any) {
    this.currentPage = event.first / event.rows;
    this.rowsPerPage = event.rows;
    this.load();
  }

  openDrawer() {
    this.editingTerrain = null;
    this.drawerVisible = true;
    this.terrainForm = { name: '', value: 0, animal_per_day: 0 };
  }

  editTerrain(terrain: QuoteTerrain | null) {
    if (!terrain) return;
    this.editingTerrain = terrain;
    this.terrainForm = { name: terrain.name, value: terrain.value, animal_per_day: terrain.animal_per_day };
    this.drawerVisible = true;
  }

  isFormValid(): boolean {
    return this.terrainForm.name.trim() !== '' && this.terrainForm.value > 0 && this.terrainForm.animal_per_day > 0;
  }

  async saveTerrain() {
    if (!this.isFormValid()) return;
    
    this.saving = true;
    try {
      if (this.editingTerrain) {
        await this.quoteTerrainService.update(this.editingTerrain.id, this.terrainForm);
        this.toastService.showSuccess('Terrain updated successfully');
      } else {
        await this.quoteTerrainService.create(this.terrainForm);
        this.toastService.showSuccess('Terrain added successfully');
      }
      this.drawerVisible = false;
      await this.load();
    } catch (error) {
      this.toastService.showError(this.editingTerrain ? 'Failed to update terrain' : 'Failed to add terrain');
    } finally {
      this.saving = false;
    }
  }

  confirmDelete(terrain: QuoteTerrain | null) {
    if (!terrain) return;
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${terrain.name}"?`,
      header: 'Delete Confirmation',
      icon: 'fa fa-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger', rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.deleteTerrain(terrain.id)
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

  async deleteTerrain(id: number) {
    try {
      await this.quoteTerrainService.delete(id);
      this.toastService.showSuccess('Terrain deleted successfully');
      await this.load();
    } catch (error) {
      this.toastService.showError('Failed to delete terrain');
    }
  }
}