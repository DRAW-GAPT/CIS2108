import { Component, OnInit } from '@angular/core';
import { getRecentFilesResult, GoogleAPIService } from '../google-api.service';

@Component({
  selector: 'app-recently-accessed',
  templateUrl: './recently-accessed.component.html',
  styleUrls: ['./recently-accessed.component.scss']
})
export class RecentlyAccessedComponent{

  constructor(public googleAPIService: GoogleAPIService) {
    this.init();
   }

  recentList$:gapi.client.drive.File[] = [];
  documents:[] = [];

  async init() {    
    await this.getMostRecentFiles();
  }
 
  async getMostRecentFiles(){
    const result = await this.googleAPIService.getMostRecent(this.recentList$);
    console.log(result);
    }

}
