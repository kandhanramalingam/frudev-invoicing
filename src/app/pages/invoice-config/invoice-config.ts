import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { InvoiceService } from '../../core/invoice.service';
import {Button} from "primeng/button";
import {ToastService} from "../../core/toast.service";

@Component({
  selector: 'app-invoice-config',
    imports: [FormsModule, QuillModule, Button],
  templateUrl: './invoice-config.html',
  styleUrl: './invoice-config.scss'
})
export class InvoiceConfig implements OnInit {
  config = {
    awa_contact: '',
    bank_detail: '',
    vat: ''
  };

  editorModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  constructor(private invoiceService: InvoiceService, private toastService: ToastService) {}

  async ngOnInit() {
    try {
      const configs = await this.invoiceService.getConfig();
      this.config = {
        awa_contact: configs['awa_contact'] || '',
        bank_detail: configs['bank_detail'] || '',
        vat: configs['vat'] || ''
      };
    } catch (err) {
      console.log(err);
      this.toastService.showError('Failed to load invoice configuration');
    }
  }

  async save() {
    try {
      for (const [type, value] of Object.entries(this.config)) {
        if (value.trim()) {
          await this.invoiceService.updateConfig(type, value);
        }
      }
      this.toastService.showSuccess('Configuration saved successfully');
    } catch (err) {
      console.log(err);
      this.toastService.showError('Failed to save configuration');
    }
  }
}