import {Component, Inject, OnInit} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {id: string, permissions: any[]}) {}

  capitaliseFirstLetter(s: string): string{
    let temp = s.charAt(0).toUpperCase() + s.slice(1);
    return temp
  }
}
