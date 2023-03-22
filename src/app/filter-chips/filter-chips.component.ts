import { Component, Input, Output } from '@angular/core';
import * as _ from 'lodash';




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
  sharedOptions:any[] = [];
  types:any[] = [];
  filteredType = this.types;
  filteredOptions = this.owners;
  filteredShared = this.sharedOptions;

  filterOptions() {
    this.filteredOptions = this.owners;
  }
  filterType() {
    this.filteredType = this.types;
  }

  filterShared() {
    this.filteredShared = this.sharedOptions;
  }


  updateDropdowns(){
    this.owners = this.getOwnersList();
    this.types = this.getTypes();
    this.sharedOptions = this.getSharedWith();
  }

  
  getOwnersList() {
    let ownersList:gapi.client.drive.User[] = this._unfilteredFiles
      .map((file:gapi.client.drive.File)=>file.owners) // get owners array
      .map((owners)=> (owners && owners[0]) ? owners[0]:null) //get 0th element (usually file only has 1 anyways) - or undefined if array is null or empty
      .filter((owner): owner is gapi.client.drive.User => owner!==null && owner!==undefined); //remove nulls/undefineds
      
      ownersList = _.uniqWith(ownersList, _.isEqual);

      return ownersList;

  }

  getTypes() {
    let extList:string[] = this._unfilteredFiles
      .map((file:gapi.client.drive.File)=>file.fileExtension) // get extension array
      .filter((ext): ext is string => ext!=null && ext.length!=0); //remove nulls and empty
      extList = _.uniq(extList);

      return extList;

  }

  ngAfterViewInit(){
    this.updateDropdowns();
  }

  getSharedWith() {
    let userList:gapi.client.drive.User[] = this._unfilteredFiles
      .flatMap((file:gapi.client.drive.File)=>file.permissions) // get permission array
      .filter((perm): perm is gapi.client.drive.Permission => perm!==null && perm!==undefined); //remove nulls/undefineds
      
      //unique by user id
      userList = _.uniqBy(userList, 'id');

      return userList;

  }

}


