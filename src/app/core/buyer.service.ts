import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import {Buyer} from "../interfaces/buyer.interface";

@Injectable({ providedIn: 'root' })
export class BuyerService {
  constructor(private db: DbService) {}

  private async init() { await this.db.init(); }

  async getBuyers(auctionId?: number | null, search?: string | null): Promise<Buyer[]> {
    await this.init();
    const params: any[] = [];
    const where: string[] = [];
    
    if (auctionId) {
      where.push('auction_reg_id = ?');
      params.push(auctionId);
    }
    
    if (search && search.trim()) {
      where.push('(firstName LIKE ? OR lastName LIKE ?)');
      params.push(`%${search.trim()}%`);
      params.push(`%${search.trim()}%`);
    }
    
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderBy = 'ORDER BY id DESC';
    
    return this.db.query<Buyer>(`SELECT wld_joint_auction_buyers_info.buyer_info_status,
                                            wld_joint_auction_buyers_info.bidno, wld_users.firstName, wld_users.lastName 
                                            FROM wld_joint_auction_buyers_info
                                            join wld_users on wld_joint_auction_buyers_info.buyer_id = wld_users.id ${whereSql} ${orderBy} LIMIT 10`, params);
  }
}