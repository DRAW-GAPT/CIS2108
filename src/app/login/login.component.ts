import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { GoogleAPIService } from '../google-api.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [GoogleAPIService]
})
export class LoginComponent {

  constructor(public googleAPIService: GoogleAPIService,private router: Router, private cookie: CookieService) { }


  // apiKey:string = this.goodleAPIService.getGoogleAPIKey();
  // clientId:string = this.goodleAPIService.getGoogleClientID();

  public showLogin(){
  
      this.googleAPIService.login(()=>{this.router.navigate(['list'])});
    }

  }
  
