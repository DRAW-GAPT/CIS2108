import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { PageSetting } from '../file-list/file-list.component';
import { getFilesResult, GoogleAPIService } from '../google-api.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
  //todo this is a temp class - need to redo with proper async
  list$:gapi.client.drive.File[] = [];
  nextPageToken$:string|undefined=undefined;

  fileList:gapi.client.drive.File[] = [];

  pageSize:number = 100;
  pageNumber:number = 1;

  filteredFiles: gapi.client.drive.File[] = [];

  constructor(public googleAPIService: GoogleAPIService){
    this.init();
  }

  updateQuery(filter: string){
    console.log(filter);
  }

  async setPageSettings($event: PageSetting) {
    this.pageSize = $event.pageSize;
    this.pageNumber = $event.pageNumber;
    await this.getMoreFilesAsNeeded()
  }

  async init() {    
    await this.getMoreFilesAsNeeded();
  }

  async getMoreFilesAsNeeded(){
    let filesNeeded:number = (this.pageNumber+2) * this.pageSize;
    console.log("need "+filesNeeded + " files")
    await this.getMoreFiles(filesNeeded);      
  }

  async getMoreFiles(limit:number) {    
    console.log("getting more files")
    let getFilesResult:getFilesResult = await this.googleAPIService.getFiles(await this.list$,limit);
    this.nextPageToken$ = getFilesResult.nextPageToken;
    this.list$ = getFilesResult.files;
  }

}
