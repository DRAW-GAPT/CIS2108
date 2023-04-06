import {CollectionViewer, SelectionChange, DataSource} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Injectable, Input} from '@angular/core';
import * as _ from 'lodash';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { GoogleAPIService } from '../google-api.service';
import { V } from '@angular/cdk/keycodes';
const byteSize = require('byte-size')


/** Flat node with expandable and level information */
// export class DynamicFlatNode {
//   constructor(
//     public item: string,
//     public level = 1,
//     public expandable = false,
//     public isLoading = false,
//   ) {}
// }

export class FileNode{
  constructor(

    public file:gapi.client.drive.File,
    public level = 1,
    public expandable = false,
    public isLoading = false,
  ){}
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable({providedIn: 'root'})
export class TreeDatabase {

  constructor (public googleApiService:GoogleAPIService){}

  /** Initial data from database */
  async initialData(filterQuery:string): Promise<FileNode[]> {
    return (await this.getRoots(filterQuery)).map(

      //fixme
      f => new FileNode(f, 1, f.mimeType == "application/vnd.google-apps.folder"),
    );;
  }

  async getRoots(filterQuery:string) {
  
    let files:gapi.client.drive.File[] = (await (this.googleApiService.getFiles([],100,filterQuery))).files;
  
    let roots = await Promise.all(files.map(f=>this.getRoot(f)))
  
    console.log("getting roots",filterQuery);
  
    let uniqRoots = _.uniqBy(roots,'id');
  
    return uniqRoots;
  }
  
  
  async getRoot(file:gapi.client.drive.File):Promise<gapi.client.drive.File>{
    if(file.parents == null){
      return file;
    } 
    else{
      let parent = await this.googleApiService.getFile(file.parents[0])
      if(parent != null)
        return this.getRoot(parent)
      else{
        console.error("lost parent")
        return file;
      }
    } 
  }

  isExpandable(node: gapi.client.drive.File): boolean {
    return node.mimeType == "application/vnd.google-apps.folder";
  }

  async getChildren(root:gapi.client.drive.File,filterQuery:string){

    console.log("children of ",root.name)
  
    if(root.mimeType != "application/vnd.google-apps.folder")
      return []
  
    let result:gapi.client.drive.File[] = []
  
    let items = await this.googleApiService.getFiles([],-1,"('"+root.id+"' in parents) AND (mimeType = 'application/vnd.google-apps.folder' OR("+filterQuery+"))",undefined);
  
    for (const f of items.files) {
        if(f.mimeType == "application/vnd.google-apps.folder"){
          result = [...result,...await this.getChildren(f,filterQuery)]
          
        } else{
          result.push(f)
        }
    }
  
    return items.files;
  
  }
}

export class DynamicDataSource implements DataSource<FileNode> {
  dataChange = new BehaviorSubject<FileNode[]>([]);

  get data(): FileNode[] {
    return this.dataChange.value;
  }
  set data(value: FileNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeComponent: FiletreeComponent,
    private _treeControl: FlatTreeControl<FileNode>,
    private _database: TreeDatabase,
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<FileNode[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if (
        (change as SelectionChange<FileNode>).added ||
        (change as SelectionChange<FileNode>).removed
      ) {
        console.log("here");
        this.handleTreeControl(change as SelectionChange<FileNode>,this._treeComponent.filterQuery);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<FileNode>,filterQuery:string) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node,filterQuery, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach(node => this.toggleNode(node,filterQuery, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  async toggleNode(node: FileNode,filterQuery:string, expand: boolean) {
    const children = this._database.getChildren(node.file,filterQuery)
    const index = this.data.indexOf(node);
    if (!children || index < 0) {
      // If no children, or cannot find the node, no op
      return;
    }

    node.isLoading = true;

    
    if (expand) {
      const nodes = (await children).map(
        f => new FileNode(f, node.level + 1, this._database.isExpandable(f)),
      );
      this.data.splice(index + 1, 0, ...nodes);
    } else {
      let count = 0;
      for (
        let i = index + 1;
        i < this.data.length && this.data[i].level > node.level;
        i++, count++
      ) {}
      this.data.splice(index + 1, count);
    }

    console.log("data change");
    // notify the change
    this.dataChange.next(this.data);
    node.isLoading = false;
  }
}

/**
 * @title Tree with dynamic data
 */
@Component({
  selector: 'app-filetree',
  templateUrl: './filetree.component.html',
  styleUrls: ['./filetree.component.scss']
})

export class FiletreeComponent {
  constructor(private database: TreeDatabase, googleApiService:GoogleAPIService) {



    this.treeControl = new FlatTreeControl<FileNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this,this.treeControl, database);

    this.setInitialData(database)
  }

  _filterQuery:string ="";

  @Input ()
  public set filterQuery(value:string){
    this._filterQuery = value;
    this.setInitialData(this.database)
  }

  public get filterQuery():string{
    return this._filterQuery;
  }

  async setInitialData(database: TreeDatabase){
    this.dataSource.data = await database.initialData(this._filterQuery);
  }

  treeControl: FlatTreeControl<FileNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: FileNode) => node.level;

  isExpandable = (node: FileNode) => node.file.mimeType == "application/vnd.google-apps.folder";

  hasChild = (_: number, _nodeData: FileNode) => _nodeData.expandable;

  byteSize = (size:number) => {
    if(size === null || size === undefined || isNaN(size)){
        return "---"
    }
    return byteSize(size)
  }

  formatLastModified = (file:gapi.client.drive.File) => {
    let user = file.lastModifyingUser?.displayName;
    let options: any = { day: '2-digit', month: '2-digit', year: 'numeric' };
    let dateTime: string = ""

    if(file.modifiedTime){
      dateTime = new Date(file.modifiedTime).toLocaleDateString(undefined, options);
    }
    if (user) return user + "; " + dateTime;
    else return dateTime
  }

   tooltip = (node: FileNode) : string =>{
     if(node.file.owners == undefined) return "Undefined"
     let owner: string = "Owner: " + node.file.owners[0].displayName + "\n";
     let last : string = "Last Modified: " + this.formatLastModified(node.file) + "\n";
     let size: string = "Size: " + this.byteSize(Number(node.file.size)) + "\n";
     return owner + last + size;
   }

}




