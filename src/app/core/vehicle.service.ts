import { Injectable } from '@angular/core';
import { DbService } from './db.service';

export interface Vehicle {
  id: number;
  make: string;
  year: number;
  type: string;
  code: string;
  registrationNumber: string;
  rate: number;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  constructor(private db: DbService) {}

  async getAll(search?: string): Promise<Vehicle[]> {
    try {
      let sql = 'SELECT * FROM wld_vehicles';
      const params: any[] = [];
      
      if (search) {
        sql += ' WHERE make LIKE ? OR code LIKE ? OR registrationNumber LIKE ?';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }
      
      sql += ' ORDER BY make';
      return await this.db.query<Vehicle>(sql, params);
    } catch (error) {
      throw new Error('Failed to load vehicles');
    }
  }

  async create(vehicle: Omit<Vehicle, 'id'>): Promise<void> {
    try {
      await this.db.execute(
        'INSERT INTO wld_vehicles (make, year, type, code, registrationNumber, rate, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [vehicle.make, vehicle.year, vehicle.type, vehicle.code, vehicle.registrationNumber, vehicle.rate, vehicle.active ? 1 : 0]
      );
    } catch (error) {
      throw new Error('Failed to create vehicle');
    }
  }

  async update(id: number, vehicle: Omit<Vehicle, 'id'>): Promise<void> {
    try {
      await this.db.execute(
        'UPDATE wld_vehicles SET make = ?, year = ?, type = ?, code = ?, registrationNumber = ?, rate = ?, active = ? WHERE id = ?',
        [vehicle.make, vehicle.year, vehicle.type, vehicle.code, vehicle.registrationNumber, vehicle.rate, vehicle.active ? 1 : 0, id]
      );
    } catch (error) {
      throw new Error('Failed to update vehicle');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.execute('DELETE FROM wld_vehicles WHERE id = ?', [id]);
    } catch (error) {
      throw new Error('Failed to delete vehicle');
    }
  }

  async updateStatus(id: number, active: boolean): Promise<void> {
    try {
      await this.db.execute('UPDATE wld_vehicles SET active = ? WHERE id = ?', [active ? 1 : 0, id]);
    } catch (error) {
      throw new Error('Failed to update vehicle status');
    }
  }
}