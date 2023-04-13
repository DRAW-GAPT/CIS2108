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
  documents: any[] = [];
  
  async init() {    
    await this.getMostRecentFiles();
  }
 
  async getMostRecentFiles(){
    const result = await this.googleAPIService.getMostRecent(this.recentList$);
    this.recentList$ = result.files;
    console.log(this.recentList$)

    this.documents = this.recentList$.map(file => ({
      name: file.name,
      owner: file.owners && file.owners.length ? file.owners[0].emailAddress : 'Unknown',
      lastModifier: file.lastModifyingUser?.displayName,
      icon: file.iconLink,
      preview: "https://drive.google.com/thumbnail?&sz=w320&id=" + file.id,
      modifiedTime: file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : 'Unknown'
    }));
    
  }

}
