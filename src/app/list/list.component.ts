import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { getFilesResult, GoogleAPIService } from '../google-api.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
  //todo this is a temp class - need to redo with proper async
  list$:Promise<gapi.client.drive.File[]> = new Promise((resolve)=>resolve([]));
  nextPageToken$:Promise<string|undefined> = new Promise((resolve)=>resolve(undefined));

  filteredFiles: gapi.client.drive.File[] = [];

  constructor(public googleAPIService: GoogleAPIService){
    this.init();
  }

  setFilteredFiles(filteredFiles: gapi.client.drive.File[]) {
    this.filteredFiles = filteredFiles;
  }

  async init() {    
    let getFilesResult:Promise<getFilesResult> = this.googleAPIService.getFiles(await this.list$,500);
    this.list$ = new Promise(async (resolve)=>{
      resolve ((await getFilesResult).files);
    })
    this.nextPageToken$ = new Promise(async (resolve)=>{
      resolve ((await getFilesResult).nextPageToken);
    })
  }

  async getMoreFiles(limit:number) {    
    let getFilesResult:Promise<getFilesResult> = this.googleAPIService.getFiles(await this.list$,limit);
    this.list$ = new Promise(async (resolve)=>{
      resolve ((await getFilesResult).files);
    })
    this.nextPageToken$ = new Promise(async (resolve)=>{
      resolve ((await getFilesResult).nextPageToken);
    })
  }
}
