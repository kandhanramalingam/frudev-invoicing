import {Injectable} from '@angular/core';
import {DbService} from './db.service';
import {Lot} from "../interfaces/lot.interface";

@Injectable({providedIn: 'root'})
export class LotService {
    constructor(private db: DbService) {
    }

    private async init() {
        await this.db.init();
    }

    async getLots(auctionId?: number | null, search?: string | null): Promise<Lot[]> {
        await this.init();
        const params: any[] = [];
        const where: string[] = [];
        
        if (auctionId) {
            where.push('auction_id = ?');
            params.push(auctionId);
        }
        
        if (search && search.trim()) {
            where.push('mainlotno LIKE ?');
            params.push(`%${search.trim()}%`);
        }
        
        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const limit = auctionId ? 'LIMIT 10' : 'LIMIT 20';
        
        return this.db.query<Lot>(`SELECT mainlotno, description, price, sum_total FROM wld_lotset ${whereSql} ORDER BY mainlotno ASC ${limit}`, params);
    }
}