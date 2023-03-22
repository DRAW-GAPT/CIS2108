import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { GoogleAPIService } from '../google-api.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {

  
  //todo this is a temp class - need to redo with proper async
  list$:Promise<gapi.client.drive.File[]> = new Promise((resolve)=>resolve([]));

  constructor(public googleAPIService: GoogleAPIService,  private cookie:CookieService){
    this.init();
  }

  async init() {    
    this.list$ = this.googleAPIService.getAllFiles();
    console.log("got all files");
  }
}
