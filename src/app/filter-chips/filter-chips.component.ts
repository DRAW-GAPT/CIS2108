import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import * as _ from 'lodash';
import { filter } from 'lodash';


@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss']
})
export class FilterChipsComponent {




  @Output() updateFilterQuery:EventEmitter<string> = new EventEmitter<string>();

  searchText!: string;



//new chips functionality
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  owners: String[] = [];
  sharedWith: String[] = [];
  permissionsSelected: String[] = [];

  addOwner(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    this.permissionsSelected.push("reader");
    // Add our fruit
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
    this.permissionsSelected.push("reader");
    // Add our fruit
    if (value) {
      this.sharedWith.push(value);
      console.log(this.filterByOwner());

    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeShared(shared: String): void {
    const index = this.sharedWith.indexOf(shared);

    if (index >= 0) {
      this.sharedWith.splice(index, 1);
    }
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
  }
  
  //filters the list by owner, called whenever a new email is added to the owner's chip
  async filterByOwner(){
    const searchQuery = `trashed=false and (${this.owners.map(owner => `'${owner}' in owners`).join(' or ')})`;
    const response = await gapi.client.drive.files.list({
      q: searchQuery,
      fields: 'nextPageToken, files(id, name, createdTime, modifiedTime, owners,size, lastModifyingUser, iconLink, fileExtension, permissions)'
    });
    console.log(response.result);
    this.owners = _.sortBy(this.owners,"displayName")

    return this.owners;
  }

  test(){
     console.log(this.filterByPermissions())
  }
  isCheckedWriter: boolean = false;
  isCheckedReader: boolean = false;
  onCheckboxChange($event: MatCheckboxChange) {
   if(this.isCheckedReader){
    this.isCheckedReader = true;
   }
   else if(this.isCheckedWriter){
    this.isCheckedWriter = true;
   }
   return false;
  }

  //TODO: under construction
  async filterByPermissions(){
    const searchQuery = `trashed=false and 'me' in (${this.permissionsSelected
      .map(permission=> `'${ permission }` ).join(' or ')})`;
    const response = await gapi.client.drive.files.list({
      q: "'me' in owners and " + searchQuery,
      fields: 'nextPageToken, files(id, name, createdTime, modifiedTime, owners,size, lastModifyingUser, iconLink, fileExtension, permissions)'
    });
    console.log(response.result);
    this.permissionsSelected = _.sortBy(this.permissionsSelected,"displayName")

    return this.permissionsSelected;
  }
  
  
}


