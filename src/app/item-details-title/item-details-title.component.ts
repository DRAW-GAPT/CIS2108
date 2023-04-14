import { Component, Input } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ShareDialogComponent } from '../share-dialog/share-dialog.component'; 
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

export class DialogContentExample {
}

@Component({
  selector: 'app-item-details-title',
  templateUrl: './item-details-title.component.html',
  styleUrls: ['./item-details-title.component.scss']
})
export class ItemDetailsTitleComponent {
  @Input() file: any;
  constructor(private dialog: MatDialog) { }

  openFile(file : gapi.client.drive.File): void {
    window.open(file.webViewLink, '_blank');
  }

  openShareDialog(): void{
    console.log(this.file)
    console.log("ID: " + this.file.id)
    console.log("PERM: " + this.file.permissions)
    this.dialog.open(ShareDialogComponent, {
      data: {
        id: this.file.id,
        permissions: this.file.permissions
      },
    });
  }


  openDeleteDialog(): void{
    this.dialog.open(DeleteDialogComponent, {
      data: {
        id: this.file.id,
        permissions: this.file.permissions
      },
    });
  }
}
