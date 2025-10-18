import {Injectable} from '@angular/core';
import {DbService} from './db.service';
import {InvoiceConfig} from "./invoice.service";
import {InvoiceConfigs, InvoiceResponse, LotListItem} from "../interfaces/lot-response.interface";
import { PaginationRequest, PaginationResponse } from '../interfaces/pagination.interface';

@Injectable({providedIn: 'root'})
export class LotService {
    constructor(private db: DbService) {
    }

    private async init() {
        await this.db.init();
    }

    async getLots(auctionId?: number | null, search?: string | null, pagination?: PaginationRequest): Promise<PaginationResponse<LotListItem>> {
        await this.init();
        const params: any[] = [];
        const where: string[] = [];

        if (auctionId) {
            where.push('wld_lotset.auction_id = ?');
            params.push(auctionId);
        }

        if (search && search.trim()) {
            where.push('wld_lotset.mainlotno LIKE ?');
            params.push(`%${search.trim()}%`);
        }

        const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
        
        // Get total count
        const countSql = `SELECT COUNT(*) as count FROM wld_lotset
                         LEFT JOIN wld_user_auctions ON wld_lotset.wla_lotno = wld_user_auctions.game_id
                         LEFT JOIN wld_users ON CASE WHEN wld_user_auctions.user_id REGEXP '^[0-9]+$' 
                                                     THEN wld_user_auctions.user_id = wld_users.id 
                                                     ELSE FALSE 
                                                END
                         ${whereSql}`;
        const countResult = await this.db.query<{count: number}>(countSql, params);
        const totalRecords = countResult[0]?.count || 0;
        
        // Get paginated data
        let sql = `SELECT wld_lotset.id,
                          wld_lotset.mainlotno,
                          wld_lotset.description,
                          wld_lotset.price,
                          wld_lotset.sum_total,
                          wld_lotset.VMStatus,
                          COALESCE(wld_users.firstName, 
                                  CASE WHEN wld_user_auctions.user_id REGEXP '^[0-9]+$' 
                                       THEN NULL 
                                       ELSE wld_user_auctions.user_id 
                                  END) as firstName,
                          COALESCE(wld_users.lastName, '') as lastName,
                          wld_lotset.userid,
                          wld_lotset.auction_id
                   FROM wld_lotset
                        LEFT JOIN wld_user_auctions ON wld_lotset.wla_lotno = wld_user_auctions.game_id
                        LEFT JOIN wld_users ON CASE WHEN wld_user_auctions.user_id REGEXP '^[0-9]+$' 
                                                    THEN wld_user_auctions.user_id = wld_users.id 
                                                    ELSE FALSE 
                                               END
                   ${whereSql}
                   ORDER BY mainlotno ASC`;
        
        if (pagination) {
            const offset = pagination.page * pagination.size;
            sql += ` LIMIT ${pagination.size} OFFSET ${offset}`;
        }
        
        const data = await this.db.query<LotListItem>(sql, params);
        
        return {
            data,
            totalRecords,
            page: pagination?.page || 0,
            size: pagination?.size || data.length
        };
    }

    async getInvoiceDetailsFromLot(lot: LotListItem): Promise<InvoiceResponse> {
        await this.init();
        try {
            console.log({...lot})
            // Get invoice configs
            const configs = await this.db.query<InvoiceConfig>('SELECT type, value FROM wld_invoice_config');
            const configMap = configs.reduce((acc, config) => {
                acc[config.type] = config.value;
                return acc;
            }, {} as any);

            // Get lot info to find wla_lotno
            const lotInfo = await this.db.query<any>(`SELECT wla_lotno
                                                      FROM wld_lotset
                                                      WHERE id = ?`, [lot.id]);
            if (!lotInfo.length) throw new Error('Lot not found');

            const wlaLotno = lotInfo[0].wla_lotno;
            if (!wlaLotno) throw new Error('wla_lotno not found for lot');

            // Get user_auctions using game_id (wla_lotno)
            const userDetailOfLot = await this.db.query<any>(`SELECT user_id
                                                              FROM wld_user_auctions
                                                              WHERE game_id = ?`, [wlaLotno]);
            if (!userDetailOfLot.length) throw new Error('User auction not found');

            const rows = await this.db.query(
                `
                    SELECT l.mainlotno                   AS Lot,
                           ua.bidder_no                  AS Buyer,
                           s.engName                     AS Item,
                           sl.male                       AS M,
                           sl.female                     AS F,
                           sl.total                      AS T,
                           ua.auction_price              AS Amount,
                           ua.total_auction_price AS Total
                    FROM wld_user_auctions ua
                             JOIN wld_lotset l
                                  ON ua.auction_id = l.auction_id
                                      AND ua.game_id = l.wla_lotno
                             LEFT JOIN wld_sublot sl
                                       ON l.id = sl.lot_id
                             LEFT JOIN wld_species s
                                       ON sl.game_species = s.id
                    WHERE ua.user_id = ?
                      AND ua.auction_id = ?;
                `,
                [userDetailOfLot[0].user_id, lot.auction_id]
            );

            console.log(userDetailOfLot[0].user_id, lot.auction_id);

            return {
                configs: configMap,
                lotDetails: rows,
                summaryDetails: []
            };
        } catch (error) {
            console.error('Error getting invoice details:', error);
            throw error;
        }
    }

    async getSpeciesData(gameSpeciesIds: number[]) {
        await this.init();
        try {
            if (!gameSpeciesIds.length) return [];
            const placeholders = gameSpeciesIds.map(() => '?').join(',');
            return this.db.query<any>(`SELECT *
                                       FROM wld_species
                                       WHERE id IN (${placeholders})`, gameSpeciesIds);
        } catch (error) {
            console.error('Error getting species data:', error);
            throw error;
        }
    }

    async getSpeciesFromLot(lotId: number) {
        await this.init();
        try {
            return this.db.query<any>(`
                SELECT s.id, s.engName, sl.total as quantity
                FROM wld_sublot sl
                JOIN wld_species s ON sl.game_species = s.id
                WHERE sl.lot_id = ?
            `, [lotId]);
        } catch (error) {
            console.error('Error getting species from lot:', error);
            throw error;
        }
    }

    async getBuyerLots(buyerId: string, auctionId: number) {
        await this.init();
        try {
            return this.db.query<any>(`
                SELECT l.id, l.mainlotno, l.description, l.sum_total,
                       ua.auction_price as auction_price, 
                       ua.total_auction_price as total_auction_price,
                       sl.male as male_total,
                       sl.female as female_total
                FROM wld_user_auctions ua
                JOIN wld_lotset l ON ua.auction_id = l.auction_id AND ua.game_id = l.wla_lotno
                LEFT JOIN wld_sublot sl ON l.id = sl.lot_id
                WHERE ua.user_id = ? AND ua.auction_id = ?
                ORDER BY l.mainlotno ASC
            `, [buyerId, auctionId]);
        } catch (error) {
            console.error('Error getting buyer lots:', error);
            throw error;
        }
    }

    async getInvoiceConfigs(): Promise<InvoiceConfigs> {
        await this.init();
        try {
            const configs = await this.db.query<InvoiceConfig>('SELECT type, value FROM wld_invoice_config');
            return configs.reduce((acc, config) => {
                acc[config.type] = config.value;
                return acc;
            }, {} as any);
        } catch (error) {
            console.error('Error getting invoice configs:', error);
            throw error;
        }
    }
}