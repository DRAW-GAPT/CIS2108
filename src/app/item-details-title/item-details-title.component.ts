import { Component, Input } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
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
    this.dialog.open(ShareDialogComponent);
  }

  openDeleteDialog(): void{
    this.dialog.open(DeleteDialogComponent);
  }
}
