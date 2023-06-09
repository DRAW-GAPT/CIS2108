import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleAPIService } from '../google-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [GoogleAPIService]
})
export class LoginComponent implements OnInit {

  constructor(
    public googleAPIService: GoogleAPIService,
     private router: Router
     ) {}

  async ngOnInit(){
    if(await this.googleAPIService.getCookie()){
      this.router.navigate(['list']);
    }
  }
  
  public showLogin(){
    //navigates to the list page
    this.googleAPIService.login(()=>{this.router.navigate(['list'])});
    }
  }
  
