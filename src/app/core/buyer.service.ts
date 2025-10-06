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
      where.push('wld_joint_auction_buyers_info.auction_reg_id = ?');
      params.push(auctionId);
    }
    
    if (search && search.trim()) {
      where.push('(wld_joint_auction_buyers_info.firstName LIKE ? OR wld_joint_auction_buyers_info.lastName LIKE ?)');
      params.push(`%${search.trim()}%`);
      params.push(`%${search.trim()}%`);
    }
    
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderBy = 'ORDER BY bidno ASC';
    
    return this.db.query<Buyer>(`SELECT wld_joint_auction_buyers_info.buyer_info_status,
                                            wld_joint_auction_buyers_info.bidno, wld_users.firstName, wld_users.lastName,
                                            wld_joint_auction_buyers_info.buyer_id, wld_joint_auction_buyers_info.value_allowed
                                            FROM wld_joint_auction_buyers_info
                                            left join wld_users on wld_joint_auction_buyers_info.buyer_id = wld_users.id ${whereSql} ${orderBy} LIMIT 1000`, params);
  }
}