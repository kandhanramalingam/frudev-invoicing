import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import { VehicleCompartment } from '../interfaces/vehicle-compartment.interface';

@Injectable({ providedIn: 'root' })
export class VehicleCompartmentService {
  constructor(private db: DbService) {}

  async getAll(search?: string): Promise<VehicleCompartment[]> {
    try {
      let sql = 'SELECT id, name, size FROM wld_vehicle_compartments';
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

  async create(data: {name: string, size?: string}): Promise<void> {
    try {
      await this.db.execute('INSERT INTO wld_vehicle_compartments (name, size) VALUES (?, ?)', [data.name, data.size || '']);
    } catch (error) {
      throw new Error('Failed to create vehicle compartment');
    }
  }

  async update(id: number, data: {name: string, size?: string}): Promise<void> {
    try {
      await this.db.execute('UPDATE wld_vehicle_compartments SET name = ?, size = ? WHERE id = ?', [data.name, data.size || '', id]);
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