import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component} from '@angular/core';
import {MatChipEditedEvent, MatChipInputEvent} from '@angular/material/chips';


@Component({
  selector: 'app-new-chips',
  templateUrl: './new-chips.component.html',
  styleUrls: ['./new-chips.component.scss']
})
export class NewChipsComponent {
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  owners: String[] = [];

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.owners.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(owner: String): void {
    const index = this.owners.indexOf(owner);

    if (index >= 0) {
      this.owners.splice(index, 1);
    }
  }

  edit(owner: String, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(owner);
      return;
    }

    // Edit existing owner
    const index = this.owners.indexOf(owner);
    if (index >= 0) {
      this.owners[index] = value;
    }
  }
  
}
