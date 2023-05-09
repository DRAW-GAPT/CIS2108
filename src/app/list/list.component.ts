import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { PageSetting } from '../file-list/file-list.component';
import { getFilesResult, GoogleAPIService } from '../google-api.service';
import { SortSetting } from '../sort-by/sort-by.component';
import {Orientation, TourStep, GuidedTour, OrientationConfiguration, GuidedTourService } from 'ngx-guided-tour';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
  public dashboardTour: GuidedTour = {
    tourId: 'home-tour',
    useOrb: false,
    steps: [
          {
            title: 'Home Page',
            content: 'This is your homepage. Here you can see your files/folders (as a tree or as a list), filter the files/folder, view your most recently accessed, etc.',
        },
        {
            title: 'Search and Filters',
            selector: '.search-bar',
            content: 'You can search for a file using this search bar.\nYou can also filter among your files/folders by owner, permissions, date and who you shared the item using these filters.',
            orientation: Orientation.Bottom
        },
        {
          title: 'Recently accessed files/folders',
          selector: '.recently',
          content: 'These are your 5 most recently accessed files.',
          orientation: Orientation.Bottom
        },
        {
          title: 'List or Tree View',
          selector: '.tab-bar',
          content: 'You can display your files/folders as either a list or as a tree by clicking on either of these tabs.\n Click on either of these files/folders to display their details and share tree.',
          orientation: Orientation.Top
        }
    ]
};


public startTour(): void {
  this.createListCookie();
  this.guidedTourService.startTour(this.dashboardTour);
}
  
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

  filterQuery:string = "trashed=false";

  constructor(private cookie: CookieService,public googleAPIService: GoogleAPIService, private guidedTourService: GuidedTourService){
  }

  ngOnInit(): void {
    if(!this.cookie.get("listCookie")){
    this.startTour();
    }
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
    //if the request is the last request (ie most recent) keep it and filter using that request, else remove it (as it is older than the most recent)
    if(requestID == this.getMoreFilesRequestID){
      //only store the results from the last request that was sent.
      //if requestID != getMoreFilesRequestID, it means that the opeartion has been
      //superseded and thus the results of this operation are no longer needed.
      //therefore we only store the result of the last request that was started
      this.nextPageToken$ = getFilesResult.nextPageToken;
      this.list$ = getFilesResult.files;
    }
  }

  treeSortSettings:SortSetting | undefined;
  updateTreeSort(sortSettings:SortSetting){
        console.log("treeSort DETECTED");
    this.treeSortSettings = sortSettings;
  }

  //sets a cookie so that the home page tutorial is only shown the first time a user opens the site
  //tutorial may still be opened by pressing the ? button present on the page
  createListCookie() {
    const date = new Date();

    date.setTime(date.getTime() + (100 * 365 * 24 * 60 * 60 * 1000)); // set to 100 years from now
    const expires = "expires=" + date.toUTCString();
    document.cookie = "listCookie=listCookie; " + expires + "; path=/";
  }
  
}

