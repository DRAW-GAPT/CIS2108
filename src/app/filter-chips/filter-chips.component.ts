import {COMMA, ENTER, S} from '@angular/cdk/keycodes';
import { Component, EventEmitter, Inject, Input, LOCALE_ID, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import * as _ from 'lodash';
import { filter, update } from 'lodash';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DateRange } from '@angular/material/datepicker';

export const DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};
@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss'],
  providers:[
    {provide: MAT_DATE_FORMATS, useValue:DATE_FORMAT},
    {provide: MAT_DATE_LOCALE, useValue: navigator.language}
  ]
})
export class FilterChipsComponent {

  constructor(private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
  ) {}


  @Output() updateFilterQuery:EventEmitter<string> = new EventEmitter<string>();

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  owners: String[] = [];
  sharedWith: String[] = [];
  permissionsSelected: String[] = [];
  startDate:  Date | null = null;
  endDate : Date | null = null;
  searchTerm: string | undefined;

  addOwner(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.owners.push(value);
      console.log(this.filterByOwner());
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  removeOwner(owner: String): void {
    const index = this.owners.indexOf(owner);

    if (index >= 0) {
      this.owners.splice(index, 1);
    }
    this.updateFilter();
  }

  editOwner(owner: String, event: MatChipEditedEvent) {
    const value = event.value.trim();
    // Remove fruit if it no longer has a name
    if (!value) {
      this.removeOwner(owner);
      return;
    }
    // Edit existing owner
    const index = this.owners.indexOf(owner);
    if (index >= 0) {
      this.owners[index] = value;
    }
  }

  addShared(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.sharedWith.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();
  }
  
  removeShared(shared: String): void {
    const index = this.sharedWith.indexOf(shared);
    if (index >= 0) {
      this.sharedWith.splice(index, 1);
    }

    this.updateFilter();
  }

  editShared(shared: String, event: MatChipEditedEvent) {
    const value = event.value.trim();

    if (!value) {
      this.removeShared(shared);
      return;
    }

    const index = this.sharedWith.indexOf(shared);
    if (index >= 0) {
      this.sharedWith[index] = value;
    }

    this.updateFilter();
  }
  
  //filters the list by owner, called whenever a new email is added to the owner's chip
  async filterByOwner(){
    this.updateFilter();
  }

  isCheckedOwner: boolean = false;
  isCheckedWriter: boolean = false;
  isCheckedReader: boolean = false;
  onCheckboxChange($event: MatCheckboxChange) {

    this.permissionsSelected = [];

    if(this.isCheckedWriter){
      this.permissionsSelected.push("writers");
    }

    if(this.isCheckedReader){
      this.permissionsSelected.push("readers");
    }

    if(this.isCheckedOwner){
      this.permissionsSelected.push("owners")
    }
    
    console.log(this.permissionsSelected)
    this.updateFilter();
  }

  updateFilter(){
    let subqueries:string[] = ["trashed=false"];
    
    if(this.owners.length > 0)
      subqueries.push(`(${this.owners.map(owner => `'${owner}' in owners`).join(' or ')})`);

    if(this.permissionsSelected.length > 0)
      subqueries.push(`${this.permissionsSelected
        .map(permission=> `'me' in ${ permission }` ).join(' or ')}`);

    if(this.sharedWith.length > 0)
      subqueries.push(`(${this.sharedWith.map(user => `'${user}' in readers`).join(' or ')})`);

    if(this.startDate && this.endDate){
      subqueries.push(`modifiedTime > '${this.startDate.toISOString()}' and modifiedTime < '${this.endDate.toISOString()}'` );
    }
    if(this.searchTerm != undefined && this.searchTerm?.length  > 0){
      subqueries.push("name contains '" + this.searchTerm + "'");
      console.log(this.searchTerm)
    }
    this.updateFilterQuery.emit(subqueries.map(s=>"("+s+")").join(" and "))
  } 
  
  onDateChange(): void {
    this.updateFilter();
  }

  onSearch():void {
    this.updateFilter();
  }
}

