import { Component, Input, OnInit } from '@angular/core';
import { GoogleAPIService } from '../google-api.service';

@Component({
  selector: 'app-version-tab',
  templateUrl: './version-tab.component.html',
  styleUrls: ['./version-tab.component.scss']
})

export class VersionTabComponent {
  @Input() id: any;
  versions: any

  constructor(
    public googleApiService: GoogleAPIService
  ) {}

  ngOnInit(){
    this.versions = this.googleApiService.getRevisions(this.id)
    .then((res: any) => {
      console.log(res)
      this.versions = res;
      this.versions.sort((a: any, b: any) =>{
        return new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime();
      })
    })
    .catch((error: any) => {
      console.error(error);
    }); 
  }

  formatLastModified(user: any, date: Date): string{
    let options: any = { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric"};
    let dt: string =  new Date(date).toLocaleDateString(undefined, options);
    let name = "Unknown user";
    
    if(user){ name = user; }
    return name + " on " + dt;
  }

}
