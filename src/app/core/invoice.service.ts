import { Injectable } from '@angular/core';
import { DbService } from './db.service';

export interface InvoiceConfig {
  type: string;
  value: string;
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
}