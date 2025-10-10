import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { QuoteValidityService } from '../../../core/quote-validity.service';
import { QuoteValidity } from '../../../interfaces/quote-validity.interface';
import {SelectModule } from "primeng/select";
import {InputNumberModule} from "primeng/inputnumber";
import { ActivatedRoute } from '@angular/router';
import { LotService } from '../../../core/lot.service';
import { SpeciesService } from '../../../core/species.service';
import { Species } from '../../../interfaces/species.interface';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'app-quote-wrapper',
    templateUrl: './quote-wrapper.html',
    imports: [
        SelectModule,
        InputNumberModule,
        ReactiveFormsModule,
        Button,
        Tooltip
    ],
    styleUrl: './quote-wrapper.scss'
})
export class QuoteWrapperComponent implements OnInit {
  quoteForm: FormGroup;
  quoteValidities: QuoteValidity[] = [];
  allSpecies: Species[] = [];
  lotId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private quoteValidityService: QuoteValidityService,
    private route: ActivatedRoute,
    private lotService: LotService,
    private speciesService: SpeciesService
  ) {
    this.quoteForm = this.fb.group({
      quoteValidity: [null],
      farmSize: [null],
      species: this.fb.array([])
    });
  }

  async ngOnInit() {
    await this.loadQuoteValidities();
    await this.loadAllSpecies();
    
    this.lotId = Number(this.route.snapshot.queryParamMap.get('lotId'));
    if (this.lotId) {
      await this.loadSpeciesFromLot();
    } else {
      this.addSpeciesRow();
    }
  }

  private async loadQuoteValidities() {
    try {
      const response = await this.quoteValidityService.getAll();
      this.quoteValidities = response.data;
    } catch (error) {
      console.error('Error loading quote validities:', error);
    }
  }

  private async loadAllSpecies() {
    try {
      const response = await this.speciesService.getSpecies();
      this.allSpecies = response.data;
    } catch (error) {
      console.error('Error loading species:', error);
    }
  }

  private async loadSpeciesFromLot() {
    if (!this.lotId) return;
    
    try {
      const lotSpecies = await this.lotService.getSpeciesFromLot(this.lotId);
        console.log({lotSpecies})
      const speciesArray = this.quoteForm.get('species') as FormArray;
      
      lotSpecies.forEach((species: any) => {
        speciesArray.push(this.fb.group({
          speciesId: [species.id],
          quantity: [species.quantity]
        }));
      });
    } catch (error) {
      console.error('Error loading species from lot:', error);
    }
  }

  get speciesArray() {
    return this.quoteForm.get('species') as FormArray;
  }

  addSpeciesRow() {
    this.speciesArray.push(this.fb.group({
      speciesId: [null],
      quantity: [null]
    }));
  }

  removeSpeciesRow(index: number) {
    this.speciesArray.removeAt(index);
  }
}