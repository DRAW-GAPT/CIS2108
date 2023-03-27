import { Component, EventEmitter, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { CookieService } from 'ngx-cookie-service';
import { PageSetting } from '../file-list/file-list.component';
import { getFilesResult, GoogleAPIService } from '../google-api.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {

  //to allow using math in html
  Math = Math;

  //todo this is a temp class - need to redo with proper async
  list$:gapi.client.drive.File[] = [];
  nextPageToken$:string|undefined=undefined;
  //store the id of the latest request
  getMoreFilesRequestID:number = 0;

  fileList:gapi.client.drive.File[] = [];

  pageSize:number = 100;
  pageNumber:number = 1;
  sortSettings:string|undefined = undefined;

  filterQuery:string = "";

  constructor(public googleAPIService: GoogleAPIService){
    this.init();
  }

  updateQuery(filter: string){
    this.filterQuery = filter;
    this.list$=[];
    this.nextPageToken$=undefined;

    this.getMoreFilesAsNeeded();
  }

  async setPageSettings($event: PageSetting) {
    this.pageSize = $event.pageSize;
    this.pageNumber = $event.pageNumber;
    await this.getMoreFilesAsNeeded();
  }


  columnNameToSortMap = new Map<string, string>([
    ["Name", "name"],
    ["Owner", ""],
    ["Last Modified", "modifiedTime"],
    ["Size", "quotaBytesUsed"]
  ]);

  async setSort($event: Sort) {

    console.log("here")

    let s = this.columnNameToSortMap.get($event.active);
    if(s == undefined){
      s = "recency";
    }
    else if($event.direction == "desc")
      s = s + " desc"

    this.sortSettings = s;

    this.list$=[];
    this.nextPageToken$=undefined;

    await this.getMoreFilesAsNeeded();
  }

  async init() {    
    await this.getMoreFilesAsNeeded();
  }

  async getMoreFilesAsNeeded(){
    let filesNeeded:number = (this.pageNumber+2) * this.pageSize;
    await this.getMoreFiles(filesNeeded);      
  }

  async getMoreFiles(limit:number) {

    this.getMoreFilesRequestID++;
    //get the id of the current request
    let requestID = this.getMoreFilesRequestID;

    let getFilesResult:getFilesResult = await this.googleAPIService.getFiles(this.list$,limit,this.filterQuery,this.sortSettings,this.nextPageToken$);
    if(requestID == this.getMoreFilesRequestID){
      //only store the results from the last request that was sent.
      //if requestID != getMoreFilesRequestID, it means that the opeartion has been
      //superseded and thus the results of this operation are no longer needed.
      //therefore we only store the result of the last request that was started
      this.nextPageToken$ = getFilesResult.nextPageToken;
      this.list$ = getFilesResult.files;
    }

  }
 
  }

