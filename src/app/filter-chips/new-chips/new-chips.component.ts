import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component} from '@angular/core';
import {MatChipEditedEvent, MatChipInputEvent} from '@angular/material/chips';
import * as _ from 'lodash';
import { filter } from 'lodash';
import { GoogleAPIService } from 'src/app/google-api.service';


@Component({
  selector: 'app-new-chips',
  templateUrl: './new-chips.component.html',
  styleUrls: ['./new-chips.component.scss']
})
export class NewChipsComponent {
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  owners: String[] = [];
  sharedWith: String[] = [];
  permissionsSelected: String[] = [];

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    this.permissionsSelected.push("reader");
    // Add our fruit
    if (value) {
      this.owners.push(value);
      console.log(this.filterByOwner());

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
  
  //filters the list by owner, called whenever a new email is added to the owner's chip
  async filterByOwner(){
    const searchQuery = `trashed=false and (${this.owners.map(owner => `'${owner}' in owners`).join(' or ')})`;
    const response = await gapi.client.drive.files.list({
      q: searchQuery,
      fields: 'nextPageToken, files(id, name, createdTime, modifiedTime, owners,size, lastModifyingUser, iconLink, fileExtension, permissions)'
    });
    console.log(response.result);
    this.owners = _.sortBy(this.owners,"displayName")

    return this.owners;
  }

  //under construction
  async filterByPermissions(){
    const searchQuery = `trashed=false and (${this.permissionsSelected
      .map(permissionsSelected=> `'${ permissionsSelected }' in permissions`).join(' or ')})`;
    const response = await gapi.client.drive.files.list({
      q: "'me' in owners and " + searchQuery,
      fields: 'nextPageToken, files(id, name, createdTime, modifiedTime, owners,size, lastModifyingUser, iconLink, fileExtension, permissions)'
    });
    console.log(response.result);
    this.owners = _.sortBy(this.owners,"displayName")

    return this.owners;
  }
}
