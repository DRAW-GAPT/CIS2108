import {LiveAnnouncer} from '@angular/cdk/a11y';
import {AfterViewInit, Component, ViewChild, Input} from '@angular/core';
import {MatSort, Sort} from '@angular/material/sort';
const byteSize = require('byte-size')


@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
})
export class FileListComponent {
  @Input() files:gapi.client.drive.File[] = [];
  pageSize: number = 25;
  pageNumber: number = 0;
  headers: string[] = ['Name', 'Owner', 'Last Modified', 'Size']

  constructor(private _liveAnnouncer: LiveAnnouncer) {}

  @ViewChild(MatSort) sort!: MatSort;
  ngAfterViewInit() {
    this.sort.sortChange.subscribe(sortState => {
      this.files.sort((a: gapi.client.drive.File, b: gapi.client.drive.File) => {
        const isAsc = sortState.direction === 'asc';
        switch (sortState.active) {
          case 'Name': 
            if(a.name && b.name) return this.compare(a.name.toLowerCase(), b.name.toLowerCase(), isAsc);
            return 0
            break;
          case 'Owner': 
            if(a.owners && b.owners && a.owners[0].displayName && b.owners[0].displayName){
              return this.compare(a.owners ? a.owners[0].displayName.toLowerCase() : '', b.owners ? b.owners[0].displayName.toLowerCase() : '', isAsc);
            }
            return 0
            break;
          case 'Last Modified': 
            return this.compare(a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0, b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0, isAsc);
          case 'Size': 
            return this.compare((a.size) ? Number(a.size) : 0, b.size ? Number(b.size) : 0, isAsc);
          default: 
            return 0;
        }
      });
    });
  }

  get paginatedData(): any[] {
    const startIndex = this.pageNumber * this.pageSize;
    return this.files.slice(startIndex, startIndex + this.pageSize);
  }
  
  
  compare = (a: string | number | Date, b: string | number | Date, isAsc: boolean): number => {
    if (a < b) {
      return isAsc ? -1 : 1;
    }
    if (a > b) {
      return isAsc ? 1 : -1;
    }
    return 0;
  }
  
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
