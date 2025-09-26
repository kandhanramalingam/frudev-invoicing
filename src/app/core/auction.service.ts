import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import {Auction} from "../interfaces/auction.interface";

export interface AuctionRecord {
  id: number;
  name: string;
  auctionDate: string; // ISO date
  createdAt?: string;
}





@Injectable({ providedIn: 'root' })
export class AuctionService {
  constructor(private db: DbService) {}

  private async init() { await this.db.init(); }

  async getAuctions(filterDate?: string | null, search?: string | null): Promise<Auction[]> {
    await this.init();
    const params: any[] = [];
    const where: string[] = [];
    if (filterDate) {
      where.push('DATE(open_date) = DATE(?)');
      params.push(filterDate);
    }
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      where.push('(CAST(id AS CHAR) LIKE ? OR NameOfAuction LIKE ?)');
      params.push(term, term);
    }
      console.log(params);
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    return this.db.query<Auction>(`SELECT id, NameOfAuction, DateOfAuction, open_date FROM wld_admin_jointco_auction ${whereSql} ORDER BY DATE(open_date) DESC, id DESC`, params);
  }

  async getAllAuctions(): Promise<Auction[]> {
    await this.init();
    return this.db.query<Auction>(`SELECT id, NameOfAuction FROM wld_admin_jointco_auction ORDER BY DATE(open_date) DESC, id DESC`);
  }

  async searchAuctions(search?: string | null): Promise<Auction[]> {
    await this.init();
    const params: any[] = [];
    let whereSql = '';
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      whereSql = 'WHERE (CAST(id AS CHAR) LIKE ? OR NameOfAuction LIKE ?)';
      params.push(term, term);
    }
    return this.db.query<Auction>(`SELECT id, NameOfAuction FROM wld_admin_jointco_auction ${whereSql} ORDER BY DATE(open_date) DESC, id DESC LIMIT 20`, params);
  }




}
