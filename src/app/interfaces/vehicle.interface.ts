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