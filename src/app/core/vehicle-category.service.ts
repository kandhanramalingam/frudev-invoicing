import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { VehicleCategory } from '../interfaces/vehicle-category.interface';
import { PaginationRequest, PaginationResponse } from '../interfaces/pagination.interface';

@Injectable({ providedIn: 'root' })
export class VehicleCategoryService {
  constructor(private db: DbService) {}

  async getAll(search?: string, pagination?: PaginationRequest): Promise<PaginationResponse<VehicleCategory>> {
    try {
      const params: any[] = [];
      let whereClause = '';
      
      if (search) {
        whereClause = ' WHERE name LIKE ?';
        params.push(`%${search}%`);
      }
      
      // Get total count
      const countSql = `SELECT COUNT(*) as count FROM wld_vehicle_categories${whereClause}`;
      const countResult = await this.db.query<{count: number}>(countSql, params);
      const totalRecords = countResult[0]?.count || 0;
      
      // Get paginated data
      let sql = `SELECT id, name FROM wld_vehicle_categories${whereClause} ORDER BY name`;
      
      if (pagination) {
        const offset = pagination.page * pagination.size;
        sql += ` LIMIT ${pagination.size} OFFSET ${offset}`;
      }
      
      const data = await this.db.query<VehicleCategory>(sql, params);
      
      return {
        data,
        totalRecords,
        page: pagination?.page || 0,
        size: pagination?.size || data.length
      };
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