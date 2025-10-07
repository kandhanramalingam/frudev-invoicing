import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { VehicleCategory } from '../interfaces/vehicle-category.interface';

@Injectable({ providedIn: 'root' })
export class VehicleCategoryService {
  constructor(private db: DbService) {}

  async getAll(search?: string): Promise<VehicleCategory[]> {
    try {
      let sql = 'SELECT id, name FROM wld_vehicle_categories';
      const params: any[] = [];
      
      if (search) {
        sql += ' WHERE name LIKE ?';
        params.push(`%${search}%`);
      }
      
      sql += ' ORDER BY name';
      return await this.db.query<VehicleCategory>(sql, params);
    } catch (error) {
      throw new Error('Failed to load vehicle categories');
    }
  }

  async create(name: string): Promise<void> {
    try {
      await this.db.execute('INSERT INTO wld_vehicle_categories (name) VALUES (?)', [name]);
    } catch (error) {
      throw new Error('Failed to create vehicle category');
    }
  }

  async update(id: number, name: string): Promise<void> {
    try {
      await this.db.execute('UPDATE wld_vehicle_categories SET name = ? WHERE id = ?', [name, id]);
    } catch (error) {
      throw new Error('Failed to update vehicle category');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.execute('DELETE FROM wld_vehicle_categories WHERE id = ?', [id]);
    } catch (error) {
      throw new Error('Failed to delete vehicle category');
    }
  }
}