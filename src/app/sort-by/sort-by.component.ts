import { Component, EventEmitter, Output } from '@angular/core';

export interface SortSetting{
  selectedValue:string;
  sortOrder:string;
}

@Component({
  selector: 'app-sort-by',
  templateUrl: './sort-by.component.html',
  styleUrls: ['./sort-by.component.scss']
})
export class SortByComponent {
  selectedValue!: string;
  sortOrder: string = "asc";

  options: string[] = ["Date Created", "Last Modified", "Modified by Me", "Shared with Me", "Viewed by Me"]
  
  @Output() notifySortChanged:EventEmitter<SortSetting> = new EventEmitter<SortSetting>();
  updateSort() {
    this.notifySortChanged.emit({
      selectedValue : this.selectedValue,
      sortOrder : this.sortOrder
    });

    console.log(this.selectedValue);
    console.log(this.sortOrder);
  }
}