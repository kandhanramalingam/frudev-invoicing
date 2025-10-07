import { Injectable } from '@angular/core';
import { DbService } from './db.service';

export interface VehicleType {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class VehicleTypeService {
  constructor(private db: DbService) {}

  async getAll(): Promise<VehicleType[]> {
    try {
      return await this.db.query<VehicleType>('SELECT id, name FROM wld_vehicle_types ORDER BY name');
    } catch (error) {
      throw new Error('Failed to load vehicle types');
    }
  }

  async create(name: string): Promise<void> {
    try {
      await this.db.execute('INSERT INTO wld_vehicle_types (name) VALUES (?)', [name]);
    } catch (error) {
      throw new Error('Failed to create vehicle type');
    }
  }

  async update(id: number, name: string): Promise<void> {
    try {
      await this.db.execute('UPDATE wld_vehicle_types SET name = ? WHERE id = ?', [name, id]);
    } catch (error) {
      throw new Error('Failed to update vehicle type');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.execute('DELETE FROM wld_vehicle_types WHERE id = ?', [id]);
    } catch (error) {
      throw new Error('Failed to delete vehicle type');
    }
  }
}