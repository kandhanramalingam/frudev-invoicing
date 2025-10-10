import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { QuoteTerrain } from '../interfaces/quote-terrain.interface';
import { PaginationRequest, PaginationResponse } from '../interfaces/pagination.interface';

@Injectable({ providedIn: 'root' })
export class QuoteTerrainService {
  constructor(private db: DbService) {}

  async getAll(search?: string, pagination?: PaginationRequest): Promise<PaginationResponse<QuoteTerrain>> {
    try {
      const params: any[] = [];
      let whereClause = '';
      
      if (search) {
        whereClause = ' WHERE name LIKE ? OR value LIKE ?';
        params.push(`%${search}%`, `%${search}%`);
      }
      
      const countSql = `SELECT COUNT(*) as count FROM wld_quote_terrain${whereClause}`;
      const countResult = await this.db.query<{count: number}>(countSql, params);
      const totalRecords = countResult[0]?.count || 0;
      
      let sql = `SELECT id, name, value, animal_per_day FROM wld_quote_terrain${whereClause} ORDER BY name`;
      
      if (pagination) {
        const offset = pagination.page * pagination.size;
        sql += ` LIMIT ${pagination.size} OFFSET ${offset}`;
      }
      
      const data = await this.db.query<QuoteTerrain>(sql, params);
      
      return {
        data,
        totalRecords,
        page: pagination?.page || 0,
        size: pagination?.size || data.length
      };
    } catch (error) {
      throw new Error('Failed to load quote terrain');
    }
  }

  async create(terrain: Omit<QuoteTerrain, 'id'>): Promise<void> {
    try {
      await this.db.execute('INSERT INTO wld_quote_terrain (name, value, animal_per_day) VALUES (?, ?, ?)', 
        [terrain.name, terrain.value, terrain.animal_per_day]);
    } catch (error) {
      throw new Error('Failed to create quote terrain');
    }
  }

  async update(id: number, terrain: Omit<QuoteTerrain, 'id'>): Promise<void> {
    try {
      await this.db.execute('UPDATE wld_quote_terrain SET name = ?, value = ?, animal_per_day = ? WHERE id = ?', 
        [terrain.name, terrain.value, terrain.animal_per_day, id]);
    } catch (error) {
      throw new Error('Failed to update quote terrain');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.execute('DELETE FROM wld_quote_terrain WHERE id = ?', [id]);
    } catch (error) {
      throw new Error('Failed to delete quote terrain');
    }
  }
}