import { Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GoogleAPIService } from '../google-api.service';

@Component({
  selector: 'app-contacts-dialog',
  templateUrl: './contacts-dialog.component.html',
  styleUrls: ['./contacts-dialog.component.scss']
})
export class ContactsDialogComponent {

  constructor(private googleApiService: GoogleAPIService,
    @Inject(MAT_DIALOG_DATA) public data: {
    id: string, 
    permissions: any[],
    name: string
  },
) {}

  capitaliseFirstLetter(s: string): string{
    let temp = s.charAt(0).toUpperCase() + s.slice(1);
    return temp
  }

  addContacts() {
    this.googleApiService.addPeopleToContacts(this.data.id);
  }
}
