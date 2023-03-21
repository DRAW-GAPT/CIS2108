import { Component } from '@angular/core';
import {FormControl} from '@angular/forms'

@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss']
})
export class FilterChipsComponent {
  searchText!: string;
  owners = ['Andrea Borg', 'Rianne Azzopardi', 'David Briffa', 'Wayne Borg', 'Ema Grech'];
  filteredOptions = this.owners;

  filterOptions() {
    this.filteredOptions = this.owners.filter(owner => {
      return owner.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }
}


