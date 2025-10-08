import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { Species, SpeciesCategory } from '../interfaces/species.interface';

@Injectable({ providedIn: 'root' })
export class SpeciesService {
  constructor(private db: DbService) {}

  private async init() {
    await this.db.init();
  }

  async getSpecies(): Promise<Species[]> {
    await this.init();
    return this.db.query<Species>(`
      SELECT s.id, s.engName, s.afcName, s.status, s.category_id, c.name as categoryName
      FROM wld_species s
      LEFT JOIN wld_species_categories c ON s.category_id = c.id
      ORDER BY s.engName
    `);
  }

  async getCategories(): Promise<SpeciesCategory[]> {
    await this.init();
    return this.db.query<SpeciesCategory>(`
      SELECT id, name 
      FROM wld_species_categories 
      ORDER BY name
    `);
  }

  async createSpecies(species: Species): Promise<void> {
    await this.init();
    await this.db.query(`
      INSERT INTO wld_species (engName, afcName, status, category_id)
      VALUES (?, ?, ?, ?)
    `, [species.engName, species.afcName, species.status, species.category_id || null]);
  }

  async updateSpecies(species: Species): Promise<void> {
    await this.init();
    await this.db.query(`
      UPDATE wld_species 
      SET engName = ?, afcName = ?, status = ?, category_id = ?
      WHERE id = ?
    `, [species.engName, species.afcName, species.status, species.category_id || null, species.id]);
  }

  async deleteSpecies(id: number): Promise<void> {
    await this.init();
    await this.db.query('DELETE FROM wld_species WHERE id = ?', [id]);
  }

  async createCategory(category: SpeciesCategory): Promise<void> {
    await this.init();
    await this.db.query('INSERT INTO wld_species_categories (name) VALUES (?)', [category.name]);
  }

  async updateCategory(category: SpeciesCategory): Promise<void> {
    await this.init();
    await this.db.query('UPDATE wld_species_categories SET name = ? WHERE id = ?', [category.name, category.id]);
  }

  async deleteCategory(id: number): Promise<void> {
    await this.init();
    await this.db.query('DELETE FROM wld_species_categories WHERE id = ?', [id]);
  }
}