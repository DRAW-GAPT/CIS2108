import { Component } from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';


@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss']
})
export class FilterChipsComponent {
  searchText!: string;
  // SET TO AN ARRAY OF OWNERS IN THE TABLE
  owners = ['Andrea Borg', 'Rianne Azzopardi', 'David Briffa', 'Wayne Borg', 'Ema Grech'];
  shared = ['None','Andrea Borg', 'Rianne Azzopardi', 'David Briffa', 'Wayne Borg'];
  types = ['.pdf','.jpg','.doc','.png'];
  filteredType = this.types;
  filteredOptions = this.owners;
  filteredShared = this.shared;

  filterOptions() {
    this.filteredOptions = this.owners.filter(owner => {
      return owner.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }
  filterType() {
    this.filteredType = this.types.filter(type => {
      return type.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }

  filterShared() {
    this.filteredShared = this.shared.filter(share => {
      return share.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }
}


