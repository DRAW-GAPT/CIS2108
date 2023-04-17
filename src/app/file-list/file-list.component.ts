import {LiveAnnouncer} from '@angular/cdk/a11y';
import {AfterViewInit, Component, ViewChild, Input, EventEmitter, Output} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
const byteSize = require('byte-size')

export interface PageSetting{
  pageSize:number
  pageNumber:number
}

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
})
export class FileListComponent {

  @Input() files:gapi.client.drive.File[] = [];
  @Input() tableLoading = true;
  //loads the next page as the user is viewing the current page
  @Input() nextPageLoading = true;

  @Output() notifyPageSettingsChanged:EventEmitter<PageSetting> = new EventEmitter<PageSetting>();
  @Output() notifySortChanged:EventEmitter<Sort> = new EventEmitter<Sort>();

  //Pagination and Headers, variables change depending on user choices, reloads page accordingly.
  pageSize: number = 25;
  pageNumber: number = 0;
  headers: string[] = ['Name', 'Owner', 'Last Modified', 'Size']

  constructor(private _liveAnnouncer: LiveAnnouncer) {}

  onPageSettingsChange($event: PageEvent) {
    this.pageNumber = $event.pageIndex; 
    this.pageSize = $event.pageSize;

    this.notifyPageSettingsChanged.emit({pageNumber:this.pageNumber,pageSize:this.pageSize});
  }

  @ViewChild(MatSort) sort!: MatSort;
  ngAfterViewInit() {
    this.notifyPageSettingsChanged.emit({pageNumber:this.pageNumber,pageSize:this.pageSize});
    this.sort.sortChange.subscribe(sortState => this.notifySortChanged.emit(sortState));
  }

  get paginatedData(): any[] {
    const startIndex = this.pageNumber * this.pageSize;

    return this.files.slice(startIndex, startIndex + this.pageSize);
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
