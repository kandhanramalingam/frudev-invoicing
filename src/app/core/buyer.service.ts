import { Injectable } from '@angular/core';
import { DbService } from './db.service';
import {Buyer} from "../interfaces/buyer.interface";
import { PaginationRequest, PaginationResponse } from '../interfaces/pagination.interface';

@Injectable({ providedIn: 'root' })
export class BuyerService {
  constructor(private db: DbService) {}

  private async init() { await this.db.init(); }

  async getBuyers(auctionId?: number | null, search?: string | null, pagination?: PaginationRequest): Promise<PaginationResponse<Buyer>> {
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
    
    // Get total count
    const countSql = `SELECT COUNT(*) as count FROM wld_joint_auction_buyers_info
                     left join wld_users on wld_joint_auction_buyers_info.buyer_id = wld_users.id ${whereSql}`;
    const countResult = await this.db.query<{count: number}>(countSql, params);
    const totalRecords = countResult[0]?.count || 0;
    
    // Get paginated data
    let sql = `SELECT wld_joint_auction_buyers_info.buyer_info_status,
                      wld_joint_auction_buyers_info.bidno, wld_users.firstName, wld_users.lastName,
                      wld_joint_auction_buyers_info.buyer_id, wld_joint_auction_buyers_info.value_allowed
               FROM wld_joint_auction_buyers_info
               left join wld_users on wld_joint_auction_buyers_info.buyer_id = wld_users.id ${whereSql}
               ORDER BY bidno ASC`;
    
    if (pagination) {
      const offset = pagination.page * pagination.size;
      sql += ` LIMIT ${pagination.size} OFFSET ${offset}`;
    }
    
    const data = await this.db.query<Buyer>(sql, params);
    
    return {
      data,
      totalRecords,
      page: pagination?.page || 0,
      size: pagination?.size || data.length
    };
  }
}