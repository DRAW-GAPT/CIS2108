import { Component, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
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


  //list of permissionIDs of selected owners
  selectedPermissions:string[] = [];
  //true if all or none of the owners are selected
  allPermissionsSelected:boolean = true;
  noPermissionsSelected:boolean = false;


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

    //filter permissions
    if(!this.allPermissionsSelected){
      res = res.filter(file=>{
        if(!file.permissions || file.permissions.length == 0){
          //this is an exceptional event if we ever reach here, something has probably gone wrong
          console.warn("user has no permissions for file",file)
          return true; //file has no owners, to avoid it being hidden forever, its better if we show it
        }
        //return owners which were selected in the filter

        let filePermissions:string[] = file.permissions
        .filter(perm=>perm.id == this.ownerOptionsMe?.permissionId) //get only my permissions
        .map(perm=>perm.role??'') 
        .filter((ext): ext is string => ext!=null && ext.length!=0); //remove nulls and empty


        return _.intersection(filePermissions,this.selectedPermissions).length>0;
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

  @ViewChildren('ownerCheckbox') ownerCheckBoxes:QueryList<MatCheckbox> = new QueryList();

  ownerFilterSelectChange($event: MatCheckboxChange) {
    let changedValue = $event.source.value
    let newChecked = $event.source.checked;


    if(changedValue == 'all' && newChecked){
      //if all was selected      
      
      //loop through all the fields and set them all to true
      this.ownerCheckBoxes.forEach(checkbox => {
        let checkboxVal = checkbox.value;

        if (!['all','none'].includes(checkboxVal)){
          checkbox.checked = true;
        }

      })
    }
    else if(changedValue == 'none' && newChecked){
      //if none was selected
      
      
      //loop through all the fields and set them all to true
      this.ownerCheckBoxes.forEach(checkbox => {
        let checkboxVal = checkbox.value;

        if (!['all','none'].includes(checkboxVal)){
          checkbox.checked = false;
        }

      })
    }


    //reset selected
    this.allOwnersSelected = true;
    this.noOwnersSelected = true;
    this.selectedOwnersID = [];

    //refill selected
    this.ownerCheckBoxes
    .filter(checkbox=>!['all','none'].includes(checkbox.value)) // filter out all and none
    .forEach(checkbox => {

      if(checkbox.checked){
        this.noOwnersSelected = false; //found at least 1
        this.selectedOwnersID.push(checkbox.value);
      } else{
        this.allOwnersSelected = false;
      }

    })

    this.filterFiles();
  }


  @ViewChildren('permissionCheckbox') permissionCheckBoxes:QueryList<MatCheckbox> = new QueryList();


  permissionFilterSelectChange($event: MatCheckboxChange) {
    let changedValue = $event.source.value
    let newChecked = $event.source.checked;


    if(changedValue == 'all' && newChecked){
      //if all was selected      
      
      //loop through all the fields and set them all to true
      this.permissionCheckBoxes.forEach(checkbox => {
        let checkboxVal = checkbox.value;

        if (!['all','none'].includes(checkboxVal)){
          checkbox.checked = true;
        }

      })
    }
    else if(changedValue == 'none' && newChecked){
      //if none was selected
      
      
      //loop through all the fields and set them all to true
      this.permissionCheckBoxes.forEach(checkbox => {
        let checkboxVal = checkbox.value;

        if (!['all','none'].includes(checkboxVal)){
          checkbox.checked = false;
        }

      })
    }


    //reset selected
    this.allPermissionsSelected = true;
    this.noPermissionsSelected = true;
    this.selectedPermissions = [];

    //refill selected
    this.permissionCheckBoxes
    .filter(checkbox=>!['all','none'].includes(checkbox.value)) // filter out all and none
    .forEach(checkbox => {

      if(checkbox.checked){
        this.noPermissionsSelected = false; //found at least 1
        this.selectedPermissions.push(checkbox.value);
      } else{
        this.allPermissionsSelected = false;
      }

    })

    this.filterFiles();
  }

  
  
}


