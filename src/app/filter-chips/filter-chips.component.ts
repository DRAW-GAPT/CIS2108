import { Component, Input, Output } from '@angular/core';
import { distinct } from '../util';



@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss']
})
export class FilterChipsComponent {

  @Input() unfilteredFiles:gapi.client.drive.File[] = [];
  @Output() filteredFiles:gapi.client.drive.File[] = [];

  searchText!: string;
  // SET TO AN ARRAY OF OWNERS IN THE TABLE
  owners = this.getOwnersList();
  shared = ['None','Andrea Borg', 'Rianne Azzopardi', 'David Briffa', 'Wayne Borg'];
  types = ['.pdf','.jpg','.doc','.png'];
  filteredType = this.types;
  filteredOptions = this.owners;
  filteredShared = this.shared;

  filterOptions() {
    // this.filteredOptions = this.owners.filter(owner => {
    //   return owner.toLowerCase().includes(this.searchText.toLowerCase());
    // });
  }
  filterType() {
    this.filteredType = this.types.filter(type => {
      return type.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }

  filterShared() {
    this.filteredShared = this.shared.filter(share => {
      return share.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }

  
  getOwnersList() {

    console.log("getting owners");

    let ownersList:gapi.client.drive.User[] = this.unfilteredFiles
      .map((file:gapi.client.drive.File)=>file.owners) // get owners array
      .map((owners)=> (owners && owners[0]) ? owners[0]:null) //get 0th element (usually file only has 1 anyways) - or undefined if array is null or empty
      .filter((owner): owner is gapi.client.drive.User => owner!==null && owner!==undefined); //remove nulls/undefineds
      
      ownersList = distinct(ownersList);

      //todo return object isntead of string
      return ownersList.map((o)=>o.emailAddress??"");

  }

}


