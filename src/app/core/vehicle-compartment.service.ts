import { Injectable } from '@angular/core';
import { DbService } from './db.service';

export interface VehicleCompartment {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class VehicleCompartmentService {
  constructor(private db: DbService) {}

  async getAll(search?: string): Promise<VehicleCompartment[]> {
    try {
      let sql = 'SELECT id, name FROM wld_vehicle_compartments';
      const params: any[] = [];
      
      if (search) {
        sql += ' WHERE name LIKE ?';
        params.push(`%${search}%`);
      }
      
      sql += ' ORDER BY name';
      return await this.db.query<VehicleCompartment>(sql, params);
    } catch (error) {
      throw new Error('Failed to load vehicle compartments');
    }
  }

  async create(name: string): Promise<void> {
    try {
      await this.db.execute('INSERT INTO wld_vehicle_compartments (name) VALUES (?)', [name]);
    } catch (error) {
      throw new Error('Failed to create vehicle compartment');
    }
  }

  async update(id: number, name: string): Promise<void> {
    try {
      await this.db.execute('UPDATE wld_vehicle_compartments SET name = ? WHERE id = ?', [name, id]);
    } catch (error) {
      throw new Error('Failed to update vehicle compartment');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.execute('DELETE FROM wld_vehicle_compartments WHERE id = ?', [id]);
    } catch (error) {
      throw new Error('Failed to delete vehicle compartment');
    }
  }
}