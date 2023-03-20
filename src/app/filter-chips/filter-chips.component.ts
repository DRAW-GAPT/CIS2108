import { Component } from '@angular/core';
import {FormControl} from '@angular/forms'

@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html',
  styleUrls: ['./filter-chips.component.scss']
})
export class FilterChipsComponent {
  permissions = new FormControl('');

  editorSelected = false;
  viewerSelected = false;
  commenterSelected = false;

  public toggle = (value: boolean) => {
    value = !value;
  }

}

