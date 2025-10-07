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
  compartments?: VehicleCompartmentDetail[];
}

export interface VehicleCompartmentDetail {
  id?: number;
  vehicle_id?: number;
  compartment_id: number;
  compartment_name?: string;
  quantity: number;
  size?: string;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  constructor(private db: DbService) {}

  async getAll(search?: string): Promise<Vehicle[]> {
    try {
      let sql = `SELECT v.*, 
        GROUP_CONCAT(CONCAT(vc.name, ' (', vcd.quantity, ')') SEPARATOR ', ') as compartments_display
        FROM wld_vehicles v
        LEFT JOIN wld_vehicle_compartment_details vcd ON v.id = vcd.vehicle_id
        LEFT JOIN wld_vehicle_compartments vc ON vcd.compartment_id = vc.id`;
      const params: any[] = [];
      
      if (search) {
        sql += ' WHERE v.make LIKE ? OR v.code LIKE ? OR v.registrationNumber LIKE ?';
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
      }
      
      sql += ' GROUP BY v.id ORDER BY v.make';
      const vehicles = await this.db.query<any>(sql, params);
      
      return vehicles.map(v => ({
        ...v,
        compartments_display: v.compartments_display || 'No compartments'
      }));
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

  async getCompartments(): Promise<{id: number, name: string, size?: string}[]> {
    try {
      return await this.db.query('SELECT id, name, size FROM wld_vehicle_compartments ORDER BY name');
    } catch (error) {
      throw new Error('Failed to load compartments');
    }
  }

  async getVehicleCompartments(vehicleId: number): Promise<VehicleCompartmentDetail[]> {
    try {
      return await this.db.query(
        `SELECT vcd.*, vc.name as compartment_name, vc.size 
         FROM wld_vehicle_compartment_details vcd
         JOIN wld_vehicle_compartments vc ON vcd.compartment_id = vc.id
         WHERE vcd.vehicle_id = ?`,
        [vehicleId]
      );
    } catch (error) {
      throw new Error('Failed to load vehicle compartments');
    }
  }

  async saveVehicleCompartments(vehicleId: number, compartments: VehicleCompartmentDetail[]): Promise<void> {
    try {
      // Delete existing compartments
      await this.db.execute('DELETE FROM wld_vehicle_compartment_details WHERE vehicle_id = ?', [vehicleId]);
      
      // Insert new compartments
      for (const comp of compartments) {
        if (comp.compartment_id && comp.quantity > 0) {
          await this.db.execute(
            'INSERT INTO wld_vehicle_compartment_details (vehicle_id, compartment_id, quantity, size) VALUES (?, ?, ?, ?)',
            [vehicleId, comp.compartment_id, comp.quantity, comp.size || '']
          );
        }
      }
    } catch (error) {
      throw new Error('Failed to save vehicle compartments');
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