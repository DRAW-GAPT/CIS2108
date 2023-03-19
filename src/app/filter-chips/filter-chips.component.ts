import { Component } from '@angular/core';

@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss']
})
export class FilterChipsComponent {
  ownerSelected = false;
  permissionsSelected = false;
  dateSelected = false;
  typeSelected = false;
  sharedWithSelected = false;
}

