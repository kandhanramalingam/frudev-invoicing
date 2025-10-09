import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { Species, SpeciesCategory } from '../interfaces/species.interface';
import { PaginationRequest, PaginationResponse } from '../interfaces/pagination.interface';

@Injectable({ providedIn: 'root' })
export class SpeciesService {
  constructor(private db: DbService) {}

  private async init() {
    await this.db.init();
  }

  async getSpecies(search?: string, pagination?: PaginationRequest): Promise<PaginationResponse<Species>> {
    await this.init();
    
    const params: any[] = [];
    let whereClause = '';
    
    if (search && search.trim()) {
      whereClause = 'WHERE s.engName LIKE ? OR s.afcName LIKE ?';
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam);
    }
    
    // Get total count
    const countSql = `SELECT COUNT(*) as count FROM wld_species s ${whereClause}`;
    const countResult = await this.db.query<{count: number}>(countSql, params);
    const totalRecords = countResult[0]?.count || 0;
    
    // Get paginated data
    let sql = `
      SELECT s.id, s.engName, s.afcName, s.status, s.category_id, c.name as categoryName
      FROM wld_species s
      LEFT JOIN wld_species_categories c ON s.category_id = c.id
      ${whereClause}
      ORDER BY s.engName
    `;
    
    if (pagination) {
      const offset = pagination.page * pagination.size;
      sql += ` LIMIT ${pagination.size} OFFSET ${offset}`;
    }
    
    const data = await this.db.query<Species>(sql, params);
    
    return {
      data,
      totalRecords,
      page: pagination?.page || 0,
      size: pagination?.size || data.length
    };
  }

  async getCategories(search?: string, pagination?: PaginationRequest): Promise<PaginationResponse<SpeciesCategory>> {
    await this.init();
    const params: any[] = [];
    let whereClause = '';
    
    if (search && search.trim()) {
      whereClause = 'WHERE name LIKE ?';
      params.push(`%${search.trim()}%`);
    }
    
    // Get total count
    const countSql = `SELECT COUNT(*) as count FROM wld_species_categories ${whereClause}`;
    const countResult = await this.db.query<{count: number}>(countSql, params);
    const totalRecords = countResult[0]?.count || 0;
    
    // Get paginated data
    let sql = `
      SELECT id, name 
      FROM wld_species_categories 
      ${whereClause}
      ORDER BY name
    `;
    
    if (pagination) {
      const offset = pagination.page * pagination.size;
      sql += ` LIMIT ${pagination.size} OFFSET ${offset}`;
    }
    
    const data = await this.db.query<SpeciesCategory>(sql, params);
    
    return {
      data,
      totalRecords,
      page: pagination?.page || 0,
      size: pagination?.size || data.length
    };
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