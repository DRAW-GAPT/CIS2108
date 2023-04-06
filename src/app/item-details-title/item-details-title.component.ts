import { Component, Input } from '@angular/core';

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
}
