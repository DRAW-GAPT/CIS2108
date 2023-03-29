import { Component, OnInit } from '@angular/core';
import { GoogleAPIService } from '../google-api.service';

@Component({
  selector: 'app-recently-accessed',
  templateUrl: './recently-accessed.component.html',
  styleUrls: ['./recently-accessed.component.scss']
})
export class RecentlyAccessedComponent{

  constructor(public googleAPIService: GoogleAPIService) { }

  
  documents:[] = [];




}
