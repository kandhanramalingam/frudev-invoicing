import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Drawer } from 'primeng/drawer';
import { Menu } from 'primeng/menu';
import { FormsModule } from '@angular/forms';
import { SpeciesService } from '../../../core/species.service';
import { ToastService } from '../../../core/toast.service';
import {HeaderComponent} from "../../../shared/header/header";
import { MenuItem, ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import {NgClass} from "@angular/common";
import {Ripple} from "primeng/ripple";
import { Species, SpeciesCategory } from '../../../interfaces/species.interface';

@Component({
  selector: 'app-species-list',
    imports: [TableModule, Button, InputText, Select, Drawer, Menu, ConfirmDialog, FormsModule, HeaderComponent, NgClass, Ripple],
  providers: [ConfirmationService],
  templateUrl: './species-list.html',
  styleUrl: './species-list.scss'
})
export class SpeciesList implements OnInit {
  species: Species[] = [];
  categories: SpeciesCategory[] = [];
  loading = false;
  drawerVisible = false;
  editMode = false;
  currentSpecies: Species = { engName: '', afcName: '', status: 'Y' };
  selectedSpecies: Species | null = null;
  statusOptions = [
    { label: 'Active', value: 'Y' },
    { label: 'Inactive', value: 'N' }
  ];

  constructor(
    private speciesService: SpeciesService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      [this.species, this.categories] = await Promise.all([
        this.speciesService.getSpecies(),
        this.speciesService.getCategories()
      ]);
    } catch (error) {
        console.log(error)
      this.toastService.showError('Failed to load data');
    } finally {
      this.loading = false;
    }
  }

  openDrawer(species?: Species) {
    this.editMode = !!species;
    this.currentSpecies = species ? { ...species } : { engName: '', afcName: '', status: 'Y' };
    this.drawerVisible = true;
  }

  async saveSpecies() {
    try {
      if (this.editMode) {
        await this.speciesService.updateSpecies(this.currentSpecies);
        this.toastService.showSuccess('Species updated successfully');
      } else {
        await this.speciesService.createSpecies(this.currentSpecies);
        this.toastService.showSuccess('Species created successfully');
      }
      await this.loadData();
      this.drawerVisible = false;
    } catch (error) {
      this.toastService.showError('Failed to save species');
    }
  }

  confirmDelete(species: Species) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${species.engName}"?`,
      header: 'Delete Confirmation',
      icon: 'fa fa-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.deleteSpecies(species)
    });
  }

  async deleteSpecies(species: Species) {
    try {
      await this.speciesService.deleteSpecies(species.id!);
      this.toastService.showSuccess('Species deleted successfully');
      await this.loadData();
    } catch (error) {
      this.toastService.showError('Failed to delete species');
    }
  }

  getMenuItems(species: Species): MenuItem[] {
    return [
      {
        label: 'Edit',
        icon: 'fa fa-pencil',
        command: () => this.openDrawer(species)
      },
      {
        label: 'Delete',
        icon: 'fa fa-trash',
        styleClass: 'text-red-600',
        command: () => this.confirmDelete(species)
      }
    ];
  }
}