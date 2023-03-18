import { Component, Input } from '@angular/core';

const byteSize = require('byte-size')

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
})
export class FileListComponent {
  @Input() files:gapi.client.drive.File[] = [];
  byteSize = (size:number) => {
    if(size === null || size === undefined){
        return "---"
    }
    return byteSize(size)
  }
  formatLastModified = (file:gapi.client.drive.File) => {
    let user = file.lastModifyingUser?.displayName;
    let options : any = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let dateTime: string = ""
    if(file.modifiedTime){
      dateTime = new Date(file.modifiedTime).toLocaleDateString(undefined, options);
    }

    if (user) return user + "; " + dateTime;
    else return dateTime
  }
}
