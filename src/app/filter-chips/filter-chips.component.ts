import { Component, Input, Output } from '@angular/core';
import { distinct } from '../util';



@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss']
})
export class FilterChipsComponent {

  _unfilteredFiles:gapi.client.drive.File[] = [];
  get unfilteredFiles():gapi.client.drive.File[] {
    return this._unfilteredFiles;
  }

  @Input() set unfilteredFiles(value:gapi.client.drive.File[]){
    this._unfilteredFiles = [...value];
    console.log(value);
    this.updateDropdowns();
  }



  @Output() filteredFiles:gapi.client.drive.File[] = [];

  searchText!: string;
  // SET TO AN ARRAY OF OWNERS IN THE TABLE
  owners:any[] = [];
  shared = ['None','Andrea Borg', 'Rianne Azzopardi', 'David Briffa', 'Wayne Borg'];
  types = ['.pdf','.jpg','.doc','.png'];
  filteredType = this.types;
  filteredOptions = this.owners;
  filteredShared = this.shared;

  filterOptions() {
    console.trace("filtering owners")
    this.filteredOptions = this.owners;
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


  updateDropdowns(){
    this.owners = this.getOwnersList();
  }

  
  getOwnersList() {

    console.log("getting owners");

    let ownersList:gapi.client.drive.User[] = this._unfilteredFiles
      .map((file:gapi.client.drive.File)=>file.owners) // get owners array
      .map((owners)=> (owners && owners[0]) ? owners[0]:null) //get 0th element (usually file only has 1 anyways) - or undefined if array is null or empty
      .filter((owner): owner is gapi.client.drive.User => owner!==null && owner!==undefined); //remove nulls/undefineds
      
      ownersList = distinct(ownersList);

      //todo return object isntead of string
      return ownersList.map((o)=>o.emailAddress??"");

  }

  ngAfterViewInit(){
    this.updateDropdowns();
  }

}


