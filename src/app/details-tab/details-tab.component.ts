import { Component, Input, OnInit} from '@angular/core';
import { GoogleAPIService } from '../google-api.service';


@Component({
  selector: 'app-details-tab',
  templateUrl: './details-tab.component.html',
  styleUrls: ['./details-tab.component.scss']
})
export class DetailsTabComponent {
  @Input() file: any;
  location_id: string = "";
  location_name: string = "";
  location_icon: string = "";
  
  constructor(
    public googleApiService: GoogleAPIService
  ) {}

  ngOnInit(): void {
    this.getParent(this.file.parents[0]);
  }
  
  formatCreated(date: Date): string{
    let options: any = { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric"};
    return new Date(date).toLocaleDateString(undefined, options);
  }

  formatLastModified = (date: Date, user:any): string => {
    user = user?.displayName;
    let options: any = { day: '2-digit', month: '2-digit', year: 'numeric' };
    let dateTime = new Date(date).toLocaleDateString(undefined, options);
    
    if (user) return dateTime + " by " + user;
    else return dateTime
  }

  fileType(mimeType: string): string{
    let temp : string = mimeType.substring(mimeType.lastIndexOf(".") + 1);
    temp = temp.substring(temp.lastIndexOf("/") + 1);
    if(temp.length < 4){
      return temp.toUpperCase();
    }
    return temp.charAt(0).toUpperCase() + temp.slice(1); 
  }

  getParent(id: string): void{
    getFile(this.googleApiService, id)
    .then((file) => {
      this.location_id = file.id ?? "";
      this.location_name = file.name ?? "---";
      this.location_icon = file.iconLink ?? "";
    })
    .catch((error) => {
      console.error(error);
    });
  }
}


async function getFile(googleApiService: GoogleAPIService, id: string) : Promise<gapi.client.drive.File>{
  let file : any =  await googleApiService.getFile(id);
  if (!file) {
    throw new Error('File not found');
  }
  return file;
}