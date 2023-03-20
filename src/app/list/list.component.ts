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
  list:gapi.client.drive.File[] = [];

  constructor(public googleAPIService: GoogleAPIService,  private cookie:CookieService){

    if(!this.cookie.get("googleAuthToken")){
      const token = gapi.client.getToken();
      const tokenString = JSON.stringify(token);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1);
      this.cookie.set('googleAuthToken', tokenString, expiryDate, '/');
    }
    this.init();
  }

  async init() {
    this.list = await this.googleAPIService.getAllFiles();
  }
}
