import { Component } from '@angular/core';
import {FormControl} from '@angular/forms'

@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss']
})
export class FilterChipsComponent {
  searchText!: string;
  options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'];
  filteredOptions = this.options;

  filterOptions() {
    this.filteredOptions = this.options.filter(option => {
      return option.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }
}


