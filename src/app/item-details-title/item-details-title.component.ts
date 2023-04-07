import { Component, Input } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'dialog-content-example',
  templateUrl: 'dialog.html',
})
export class DialogContentExample {
}

@Component({
  selector: 'app-item-details-title',
  templateUrl: './item-details-title.component.html',
  styleUrls: ['./item-details-title.component.scss']
})
export class ItemDetailsTitleComponent {
  @Input() file: any;

  openFile(file : gapi.client.drive.File): void {
    window.open(file.webViewLink, '_blank');
  }

  constructor(public dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(DialogContentExample);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
