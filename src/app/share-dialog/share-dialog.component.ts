import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss']
})
export class ShareDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    id: string, 
    permissions: any[],
    name: string
  }) {}
  capitaliseFirstLetter(s: string): string{
    let temp = s.charAt(0).toUpperCase() + s.slice(1);
    return temp
  }
}
