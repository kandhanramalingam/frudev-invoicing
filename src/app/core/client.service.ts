import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { Client } from '../interfaces/client.interface';

@Injectable({ providedIn: 'root' })
export class ClientService {
  constructor(private db: DbService) {}

  private async init() {
    await this.db.init();
  }

  async getClients(): Promise<Client[]> {
    await this.init();
    return this.db.query<Client>(`
      SELECT id, firstName, lastName, email, address, mobile, status
      FROM wld_users
      ORDER BY firstName, lastName
    `);
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