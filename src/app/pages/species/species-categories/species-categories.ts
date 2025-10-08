import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Drawer } from 'primeng/drawer';
import { Menu } from 'primeng/menu';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { SpeciesService } from '../../../core/species.service';
import { ToastService } from '../../../core/toast.service';
import { HeaderComponent } from '../../../shared/header/header';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { NgClass } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { SpeciesCategory } from '../../../interfaces/species.interface';

@Component({
  selector: 'app-species-categories',
  imports: [TableModule, Button, InputText, Drawer, Menu, ConfirmDialog, FormsModule, HeaderComponent, NgClass, Ripple],
  providers: [ConfirmationService],
  templateUrl: './species-categories.html',
  styleUrl: './species-categories.scss'
})
export class SpeciesCategories implements OnInit {
  categories: SpeciesCategory[] = [];
  loading = false;
  drawerVisible = false;
  editMode = false;
  currentCategory: SpeciesCategory = { name: '' };
  selectedCategory: SpeciesCategory | null = null;

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
      this.categories = await this.speciesService.getCategories();
    } catch (error) {
      this.toastService.showError('Failed to load categories');
    } finally {
      this.loading = false;
    }
  }

  openDrawer(category?: SpeciesCategory) {
    this.editMode = !!category;
    this.currentCategory = category ? { ...category } : { name: '' };
    this.drawerVisible = true;
  }

  async saveCategory() {
    try {
      if (this.editMode) {
        await this.speciesService.updateCategory(this.currentCategory);
        this.toastService.showSuccess('Category updated successfully');
      } else {
        await this.speciesService.createCategory(this.currentCategory);
        this.toastService.showSuccess('Category created successfully');
      }
      await this.loadData();
      this.drawerVisible = false;
    } catch (error) {
      this.toastService.showError('Failed to save category');
    }
  }

  confirmDelete(category: SpeciesCategory) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${category.name}"?`,
      header: 'Delete Confirmation',
      icon: 'fa fa-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.deleteCategory(category)
    });
  }

  async deleteCategory(category: SpeciesCategory) {
    try {
      await this.speciesService.deleteCategory(category.id!);
      this.toastService.showSuccess('Category deleted successfully');
      await this.loadData();
    } catch (error) {
      this.toastService.showError('Failed to delete category');
    }
  }

  getMenuItems(category: SpeciesCategory): MenuItem[] {
    return [
      {
        label: 'Edit',
        icon: 'fa fa-pencil',
        command: () => this.openDrawer(category)
      },
      {
        label: 'Delete',
        icon: 'fa fa-trash',
        styleClass: 'text-red-600',
        command: () => this.confirmDelete(category)
      }
    ];
  }
}