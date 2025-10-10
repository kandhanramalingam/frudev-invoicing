import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { QuoteValidity } from '../interfaces/quote-validity.interface';
import { PaginationRequest, PaginationResponse } from '../interfaces/pagination.interface';

@Injectable({ providedIn: 'root' })
export class QuoteValidityService {
  constructor(private db: DbService) {}

  async getAll(search?: string, pagination?: PaginationRequest): Promise<PaginationResponse<QuoteValidity>> {
    try {
      const params: any[] = [];
      let whereClause = '';
      
      if (search) {
        whereClause = ' WHERE days LIKE ?';
        params.push(`%${search}%`);
      }
      
      const countSql = `SELECT COUNT(*) as count FROM wld_quote_validity${whereClause}`;
      const countResult = await this.db.query<{count: number}>(countSql, params);
      const totalRecords = countResult[0]?.count || 0;
      
      let sql = `SELECT id, days FROM wld_quote_validity${whereClause} ORDER BY days`;
      
      if (pagination) {
        const offset = pagination.page * pagination.size;
        sql += ` LIMIT ${pagination.size} OFFSET ${offset}`;
      }
      
      const data = await this.db.query<QuoteValidity>(sql, params);
      
      return {
        data,
        totalRecords,
        page: pagination?.page || 0,
        size: pagination?.size || data.length
      };
    } catch (error) {
      throw new Error('Failed to load quote validity');
    }
  }

  async create(days: number): Promise<void> {
    try {
      await this.db.execute('INSERT INTO wld_quote_validity (days) VALUES (?)', [days]);
    } catch (error) {
      throw new Error('Failed to create quote validity');
    }
  }

  async update(id: number, days: number): Promise<void> {
    try {
      await this.db.execute('UPDATE wld_quote_validity SET days = ? WHERE id = ?', [days, id]);
    } catch (error) {
      throw new Error('Failed to update quote validity');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.execute('DELETE FROM wld_quote_validity WHERE id = ?', [id]);
    } catch (error) {
      throw new Error('Failed to delete quote validity');
    }
  }
}