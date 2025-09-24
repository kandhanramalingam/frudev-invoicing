import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Checkbox } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { RadioButton } from 'primeng/radiobutton';
import { InputNumber } from 'primeng/inputnumber';
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-crud-customer',
  imports: [
    ButtonModule,
    Select,
    InputText,
    Textarea,
    Checkbox,
    FormsModule,
    ReactiveFormsModule,
    RadioButton,
    InputTextModule,
    TabsModule,
    InputNumber,
    NgIf
    
  ],
  templateUrl: './crud-customer.html',
  styleUrl: './crud-customer.scss'
})
export class CrudCustomer {
  customerForm!: FormGroup;
  activeIndex = 1; // Default to Address tab (index 1)
  
  salutations = [
    { label: 'Mr.', value: 'mr' },
    { label: 'Ms.', value: 'ms' },
    { label: 'Mrs.', value: 'mrs' },
    { label: 'Dr.', value: 'dr' }
  ];

  displayNameOptions = [
    { label: 'First Name Last Name', value: 'firstlast' },
    { label: 'Last Name, First Name', value: 'lastfirst' },
    { label: 'Company Name', value: 'company' }
  ];

  countryOptions = [
    { label: 'Select Country', value: null },
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'Australia', value: 'AU' },
    { label: 'Germany', value: 'DE' },
    { label: 'France', value: 'FR' },
    { label: 'India', value: 'IN' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.customerForm = this.fb.group({
      // Basic Details
      customerType: ['business'],
      salutation: [null],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      companyName: [''],
      displayName: [null, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      workPhone: [null],
      mobilePhone: [null],
      
      // Billing Address
      billingAttention: [''],
      billingCountry: [null],
      billingStreet1: [''],
      billingStreet2: [''],
      
      // Shipping Address
      shippingAttention: [''],
      shippingCountry: [null],
      shippingStreet1: [''],
      shippingStreet2: [''],
      copyBillingAddress: [false]
    });

    // Watch for copy billing address changes
    this.customerForm.get('copyBillingAddress')?.valueChanges.subscribe(copy => {
      if (copy) {
        this.copyBillingToShipping();
      }
    });
  }

  copyBillingToShipping() {
    const billing = this.customerForm.value;
    this.customerForm.patchValue({
      shippingAttention: billing.billingAttention,
      shippingCountry: billing.billingCountry,
      shippingStreet1: billing.billingStreet1,
      shippingStreet2: billing.billingStreet2
    });
  }

  onSave() {
    if (this.customerForm.valid) {
      console.log('Form Data:', this.customerForm.value);
      // Handle save logic here
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.customerForm.reset();
    this.initializeForm();
  }

  private markFormGroupTouched() {
    Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper method to check if field has error
  hasError(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Helper method to get error message
  getErrorMessage(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    if (field?.errors?.['required']) {
      return 'This field is required';
    }
    if (field?.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    return '';
  }
}
