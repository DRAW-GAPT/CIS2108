import { Component } from '@angular/core';

@Component({
  selector: 'app-sort-by',
  templateUrl: './sort-by.component.html',
  styleUrls: ['./sort-by.component.scss']
})
export class SortByComponent {
  selectedValue!: string;

  options: string[] = ["Date Created", "Last Modified", "Modified by Me", "Shared with Me", "Viewed by Me"]

}
