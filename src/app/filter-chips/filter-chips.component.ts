import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Component, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
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
    this.updateDropdowns();
    this.filterFiles();
  }

  @Output() updateFilteredFiles:EventEmitter<gapi.client.drive.File[]> = new EventEmitter<gapi.client.drive.File[]>();

  searchText!: string;



  //list of distinct owners (minus authenticated user)
  ownerOptions:gapi.client.drive.User[] = [];
  //authenticated user
  ownerOptionsMe:gapi.client.drive.User|null = null;


  //list of permissionIDs of selected owners
  selectedOwnersID:string[] = [];
  //true if all or none of the owners are selected
  allOwnersSelected:boolean = true;
  noOwnersSelected:boolean = false;

  sharedOptions:gapi.client.drive.Permission[] = [];
  typeOptions:string[] = [];


  updateDropdowns(){
    this.ownerOptions = this.getOwnersList();
    this.typeOptions = this.getTypes();
    this.sharedOptions = this.getSharedWith();
  }

  
  getOwnersList() {
    let ownersList:gapi.client.drive.User[] = this._unfilteredFiles
      .map((file:gapi.client.drive.File)=>file.owners) // get owners array
      .map((owners)=> (owners && owners[0]) ? owners[0]:null) //get 0th element (usually file only has 1 anyways) - or undefined if array is null or empty
      .filter((owner): owner is gapi.client.drive.User => owner!==null && owner!==undefined); //remove nulls/undefineds
      
      ownersList = _.uniqWith(ownersList, _.isEqual);


      let me = _.remove(ownersList,(owner)=>owner.me);

      

      if(me.length == 0){
        console.warn("couldn't find user in list of owners, this could either be an error or possibly mean that the owner actualy doesn't own any files");
        this.ownerOptionsMe = null;
      } else{
        this.ownerOptionsMe = me[0];
      }

      ownersList = _.sortBy(ownersList,"displayName")

      return ownersList;

  }

  getTypes() {
    let extList:string[] = this._unfilteredFiles
      .map((file:gapi.client.drive.File)=>file.fileExtension) // get extension array
      .filter((ext): ext is string => ext!=null && ext.length!=0); //remove nulls and empty
      extList = _.uniq(extList);

      return extList;

  }

  @ViewChild('menu') ownerMenu: any

  filterFiles(){
    let res = this.unfilteredFiles;
  

    //filter owners
    if(!this.allOwnersSelected){
      res = res.filter(file=>{
        if(!file.owners || file.owners.length == 0){
          //this is an exceptional event if we ever reach here, something has probably gone wrong
          console.warn("file has no owners",file)
          return true; //file has no owners, to avoid it being hidden forever, its better if we show it
        }
        //return owners which were selected in the filter
        return this.selectedOwnersID.includes(file.owners[0].permissionId??'');
      })
    }

    this.updateFilteredFiles.emit(res)
  }

  ngAfterViewInit(){
    this.updateDropdowns();
    this.filterFiles();
  }

  getSharedWith() {
    let permList:gapi.client.drive.Permission[] = this._unfilteredFiles
      .flatMap((file:gapi.client.drive.File)=>file.permissions) // get permission array
      .filter((perm): perm is gapi.client.drive.Permission => perm!==null && perm!==undefined); //remove nulls/undefineds
      
      //unique by user id
      permList = _.uniqBy(permList, 'id');

      return permList;

  }



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

  //under construction
  async filterByPermissions(){
    const searchQuery = `trashed=false and (${this.permissionsSelected
      .map(permissionsSelected=> `'${ permissionsSelected }' in permissions`).join(' or ')})`;
    const response = await gapi.client.drive.files.list({
      q: "'me' in owners and " + searchQuery,
      fields: 'nextPageToken, files(id, name, createdTime, modifiedTime, owners,size, lastModifyingUser, iconLink, fileExtension, permissions)'
    });
    console.log(response.result);
    this.owners = _.sortBy(this.owners,"displayName")

    return this.owners;
  }
  
  
}


