import { Injectable } from '@angular/core';
import { DbService } from './db.service';

export interface InvoiceConfig {
  type: string;
  value: string;
}

export interface GeneratedInvoice {
  id: number;
  invoice_number: string;
  auction_id: number;
  buyer_id: string;
  lot_numbers: string;
  total_amount: number;
  invoice_file: any;
  file_name: string;
  file_type: string;
  status: 'Pending' | 'Paid' | 'Cancelled';
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  constructor(private db: DbService) {}

  private async init() {
    await this.db.init();
  }

  async getConfig(): Promise<Record<string, string>> {
    await this.init();
    const configs = await this.db.query<InvoiceConfig>('SELECT type, value FROM wld_invoice_config');
    return configs.reduce((acc, config) => {
      acc[config.type] = config.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async updateConfig(type: string, value: string): Promise<void> {
    await this.init();
    await this.db.execute(
      'INSERT INTO wld_invoice_config (type, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      [type, value, value]
    );
  }

  async saveInvoice(invoiceData: {
    auction_id: number;
    buyer_id: string;
    lot_numbers: string;
    total_amount: number;
    invoice_file: Uint8Array;
    file_name: string;
  }): Promise<string> {
    await this.init();
    const invoice_number = `INV-${Date.now()}`;
    
    await this.db.execute(
      `INSERT INTO wld_generated_invoices 
       (invoice_number, auction_id, buyer_id, lot_numbers, total_amount, invoice_file, file_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_number,
        invoiceData.auction_id,
        invoiceData.buyer_id,
        invoiceData.lot_numbers,
        invoiceData.total_amount,
        invoiceData.invoice_file,
        invoiceData.file_name
      ]
    );
    
    return invoice_number;
  }

  async getGeneratedInvoices(auction_id: number, buyer_id: string): Promise<GeneratedInvoice[]> {
    await this.init();
    return this.db.query<GeneratedInvoice>(
      'SELECT * FROM wld_generated_invoices WHERE auction_id = ? AND buyer_id = ? ORDER BY created_at DESC',
      [auction_id, buyer_id]
    );
  }

  async deleteInvoice(invoice_number: string): Promise<void> {
    await this.init();
    await this.db.execute(
      'DELETE FROM wld_generated_invoices WHERE invoice_number = ?',
      [invoice_number]
    );
  }

  async getInvoicedLotNumbers(auction_id: number, buyer_id: string): Promise<string[]> {
    await this.init();
    const invoices = await this.db.query<{lot_numbers: string}>(
      'SELECT lot_numbers FROM wld_generated_invoices WHERE auction_id = ? AND buyer_id = ?',
      [auction_id, buyer_id]
    );
    
    const allLotNumbers: string[] = [];
    invoices.forEach(invoice => {
      const lotNumbers = invoice.lot_numbers.split(',').map(num => num.trim());
      allLotNumbers.push(...lotNumbers);
    });
    
    return allLotNumbers;
  }

  async areAllLotsInvoiced(auction_id: number, buyer_id: string): Promise<boolean> {
    await this.init();
    
    // Get total lots for buyer using the same logic as lot retrieval
    const totalLots = await this.db.query<{count: number}>(
      `SELECT COUNT(DISTINCT l.mainlotno) as count
       FROM wld_user_auctions ua
       JOIN wld_lotset l ON ua.auction_id = l.auction_id AND ua.game_id = l.wla_lotno
       WHERE ua.user_id = ? AND ua.auction_id = ?`,
      [buyer_id, auction_id]
    );
    
    const totalCount = totalLots[0]?.count || 0;
    
    // If buyer has no lots, return false (don't show tick)
    if (totalCount === 0) {
      return false;
    }
    
    const invoicedLots = await this.getInvoicedLotNumbers(auction_id, buyer_id);
    
    return totalCount === invoicedLots.length;
  }
}