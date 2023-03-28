import {COMMA, ENTER, S} from '@angular/cdk/keycodes';
import { Component, EventEmitter, Inject, Input, LOCALE_ID, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import * as _ from 'lodash';
import { filter, update } from 'lodash';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

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

  //methods to handle input received from the 'Owner' filter
  addOwner(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.owners.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();
    this.updateFilter();
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
    //Remove email if reduced to nothing
    if (!value) {
      this.removeOwner(owner);
      return;
    }
    //For when users double click and edit the input
    const index = this.owners.indexOf(owner);
    if (index >= 0) {
      this.owners[index] = value;
    }

    this.updateFilter();
  }
  
  //methods to handle the input received from the 'Shared with' filter
  addShared(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.sharedWith.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();

    this.updateFilter();

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
    //Remove email if reduced to nothing
    if (!value) {
      this.removeShared(shared);
      return;
    }
    //for when users double click and edit the input
    const index = this.sharedWith.indexOf(shared);
    if (index >= 0) {
      this.sharedWith[index] = value;
    }
    this.updateFilter();
  }
  
  //Methods to handle filters being changed
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
    this.updateFilter();
  }
   //filters the list by owner, called whenever a new email is added to the owner's chip
  async filterByOwner(){
    this.updateFilter();
  }
  onDateChange(): void {
    this.updateFilter();
  }

  onSearch():void {
    this.updateFilter();
  }

  //sends query to google api according to the search terms entered into the filter (in google-api.service.ts 'q')
  updateFilter(){
    console.log("test")
    let subqueries:string[] = ["trashed=false"];
    if(this.owners.length > 0){
      subqueries.push(`(${this.owners.map(owner => `'${owner}' in owners`).join(' or ')})`);
    }
    if(this.permissionsSelected.length > 0){
      subqueries.push(`${this.permissionsSelected.map(permission=> `'me' in ${ permission }` ).join(' or ')}`);
    }
    if(this.sharedWith.length > 0){
      subqueries.push(`(${this.sharedWith.map(user => `'${user}' in readers`).join(' or ')})`);
    }
    if(this.startDate && this.endDate){
      subqueries.push(`modifiedTime > '${this.startDate.toISOString()}' and modifiedTime < '${this.endDate.toISOString()}'` );
    }
    if(this.searchTerm != undefined && this.searchTerm?.length  > 0){
      subqueries.push("name contains '" + this.searchTerm + "'");
    }
    this.updateFilterQuery.emit(subqueries.map(s=>"("+s+")").join(" and "))
  } 
}

