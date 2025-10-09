import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { Client } from '../interfaces/client.interface';
import { PaginationRequest, PaginationResponse } from '../interfaces/pagination.interface';

@Injectable({ providedIn: 'root' })
export class ClientService {
  constructor(private db: DbService) {}

  private async init() {
    await this.db.init();
  }

  async getClients(search?: string, pagination?: PaginationRequest): Promise<PaginationResponse<Client>> {
    await this.init();
    
    const params: any[] = [];
    let whereClause = '';
    
    if (search && search.trim()) {
      whereClause = 'WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ?';
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    // Get total count
    const countSql = `SELECT COUNT(*) as count FROM wld_users ${whereClause}`;
    const countResult = await this.db.query<{count: number}>(countSql, params);
    const totalRecords = countResult[0]?.count || 0;
    
    // Get paginated data
    let sql = `
      SELECT id, firstName, lastName, email, address, mobile, status
      FROM wld_users
      ${whereClause}
      ORDER BY firstName, lastName
    `;
    
    if (pagination) {
      const offset = pagination.page * pagination.size;
      sql += ` LIMIT ${pagination.size} OFFSET ${offset}`;
    }
    
    const data = await this.db.query<Client>(sql, params);
    
    return {
      data,
      totalRecords,
      page: pagination?.page || 0,
      size: pagination?.size || data.length
    };
  }

  async createClient(client: Client): Promise<void> {
    await this.init();
    await this.db.query(`
      INSERT INTO wld_users (firstName, lastName, email, address, mobile, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [client.firstName, client.lastName, client.email, client.address, client.mobile, client.status]);
  }

  async updateClient(client: Client): Promise<void> {
    await this.init();
    await this.db.query(`
      UPDATE wld_users 
      SET firstName = ?, lastName = ?, email = ?, address = ?, mobile = ?, status = ?
      WHERE id = ?
    `, [client.firstName, client.lastName, client.email, client.address, client.mobile, client.status, client.id]);
  }

  async deleteClient(id: number): Promise<void> {
    await this.init();
    await this.db.query('DELETE FROM wld_users WHERE id = ?', [id]);
  }
}