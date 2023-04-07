import {CollectionViewer, SelectionChange, DataSource} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Injectable, Input} from '@angular/core';
import * as _ from 'lodash';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { GoogleAPIService } from '../google-api.service';
import { firstTrue, truePromise } from '../util';
import { SortByComponent } from '../sort-by/sort-by.component';
import { NgModule } from '@angular/core';

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

  constructor (public googleApiService:GoogleAPIService){
    
  }

  /** Initial data from database */
  async initialData(_treeComponent: FiletreeComponent,reqID:number,filterQuery:string): Promise<FileNode[]> {
    return (await this.getRoots(_treeComponent, reqID, filterQuery)).map(

      //fixme
      f => new FileNode(f, 1, f.mimeType == "application/vnd.google-apps.folder"),
    );;
  }

  async getRoots(_treeComponent: FiletreeComponent,reqID:number,filterQuery:string) {
    
    filterQuery = "trashed = false";
    let orderBy = "";
    this.setFilter(filterQuery);

    let files:gapi.client.drive.File[] = (await (this.googleApiService.getFiles([],100,filterQuery, orderBy))).files;
  
    let roots = await Promise.all(files.map(f=>this.getRoot(_treeComponent,reqID,f)))
  
    console.log("getting roots",filterQuery);
  
    let uniqRoots = _.uniqBy(roots,'id');
  
    return uniqRoots;
  }
  
  
  async getRoot(_treeComponent: FiletreeComponent,reqID:number,file:gapi.client.drive.File):Promise<gapi.client.drive.File>{
    if(file.parents == null){
      return file;
    } 
    else{
      
    //if request is stil valid add the current folder to cache
    if(reqID == _treeComponent.latestRootsRequestID)
      //we know that the folder already contains at least 1 item which matches the filter, since we're getting the root of that item
      _treeComponent.knownGoodFoldersCache.set(file.id as string,truePromise);


      //if we already have a promise to get the root of this file, then we return that instead of working it out again
      if(file.id &&  _treeComponent.knownRootsCache.has(file.id)){
        console.log("cache hit",file.name)
        return _treeComponent.knownRootsCache.get(file.id) as gapi.client.drive.File;
      }
      console.log("cache miss",file.name)

      let parent = await this.googleApiService.getFile(file.parents[0])
      if(parent != null){
        let promise = this.getRoot(_treeComponent,reqID, parent);

        //check if the current request is still valid
        if(reqID == _treeComponent.latestRootsRequestID)     
        //   //add the promise to the cache so it won't be calculated twice   
          _treeComponent.knownRootsCache.set(file.id as string,promise);

        return promise;
      }else{
        console.error("lost parent")
        return file;
      }
    } 
  }

  setFilter(filterQuery:String){
    const sortByComponent = new SortByComponent();
    const sortValue= sortByComponent.selectedValue;
    let sortOrder = sortByComponent.sortOrder;
    let orderBy = "";

    //filterQuery = "trashed = false and mimeType != 'application/vnd.google-apps.folder' and 'me' in owners";
    if(sortValue == "Last Modified"){
      orderBy = "modifiedTime "+ sortOrder;
    }
    if(sortValue == "Date Created"){
      orderBy = "createdTime "+ sortOrder;
    }
    if(sortValue == "Viewed by Me"){
      orderBy = "viewedByMeTime "+ sortOrder;
    }
    if(sortValue == "Modified by Me"){
      filterQuery += " AND modifiedByMe=true"
      orderBy = "modifiedTime "+ sortOrder;
    }
    if(sortValue == "Shared with Me"){
      filterQuery += " AND sharedWithMe"
      orderBy = "modifiedTime "+ sortOrder;
    }
    else{
      console.log("no filter applied");
    }
  }

  isExpandable(node: gapi.client.drive.File): boolean {
    return node.mimeType == "application/vnd.google-apps.folder";
  }

  async getChildren(_treeComponent: FiletreeComponent,reqID:number,root:gapi.client.drive.File,filterQuery:string){  
    if(root.mimeType != "application/vnd.google-apps.folder")
      return []
  
  
    let items = await this.googleApiService.getFiles([],-1,"('"+root.id+"' in parents) AND (mimeType = 'application/vnd.google-apps.folder' OR("+filterQuery+"))",undefined);
  

    //promise.all is used to execute all of them in parallell
    let filterResults:boolean[] = await Promise.all(items.files.map(f=>this.showItem(_treeComponent,reqID, f,filterQuery)));
    console.log("got results from filter")
    let filtered:gapi.client.drive.File[] = 
      //start a chain
      _.chain(items.files)
      //zip the into tuples of [file,boolean] where boolean stores the result of showItem
      .zip(filterResults)
      //filter those tuples where the predicate returned true
      .filter(1)
      //get the files
      .map(tuple=>tuple[0] as gapi.client.drive.File)
      .value();
    
    return filtered
  
  }

  async showItem(_treeComponent: FiletreeComponent,reqID:number,item:gapi.client.drive.File,filterQuery:string):Promise<boolean>{


    //if request is not still valid return false as we will get discarded anyways
    if(reqID != _treeComponent.latestRootsRequestID)
      return false;

    //if its not a filtered, it should have already been filtered by google api
    if(item.mimeType != "application/vnd.google-apps.folder")
      return true;
    else if (_treeComponent.knownGoodFoldersCache.has(item.id as string)){
      console.log("child cache hit",item.name)
      return _treeComponent.knownGoodFoldersCache.get(item.id as string) as Promise<boolean>
    }

    console.log("child cache miss")


    let childItems = await this.googleApiService.getFiles([],-1,"('"+item.id+"' in parents) AND (mimeType = 'application/vnd.google-apps.folder' OR("+filterQuery+"))",undefined);
    
    let promises:Promise<boolean>[] = childItems.files.map(child=>this.showItem(_treeComponent,reqID,child,filterQuery));
    
    let res = firstTrue(promises);

    //if request is stil valid add the current folder to cache
    if(reqID == _treeComponent.latestRootsRequestID)
      _treeComponent.knownGoodFoldersCache.set(item.id as string,res);

    //todo https://stackoverflow.com/questions/51160260/clean-way-to-wait-for-first-true-returned-by-promise
    return res;
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
    //when getting children pass the latestRootsRequestID, so that if the filters change, and thus a new rootsrequested is needed, the getChildren method can stop
    const children = this._database.getChildren(this._treeComponent,this._treeComponent.latestRootsRequestID, node.file,filterQuery)
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
    this.dataSource.data = [];
    this.setInitialData(this.database)
  }

  public get filterQuery():string{
    return this._filterQuery;
  }

  //store the id of the latest request
  public latestRootsRequestID:number = 0;

  //stores a set of ids of known folders that we already know that pass the filter
  //the value is yes if the folder is known to be good
  public knownGoodFoldersCache:Map<string,Promise<boolean>> = new Map();
  //if we already know or are already waiting to get the root of a folder, we don't need to get that twice
  public knownRootsCache:Map<string,Promise<gapi.client.drive.File>> = new Map();


  async setInitialData(database: TreeDatabase){
    this.latestRootsRequestID++;
    let reqID:number = this.latestRootsRequestID

    var startTime = performance.now()
    let data = await database.initialData(this,reqID,this._filterQuery);
    var endTime = performance.now()
    console.log(`roots took ${endTime - startTime} milliseconds`)

    if(reqID == this.latestRootsRequestID)
      //only accept data if it hasnt been superseeded by a newer version
      this.dataSource.data = data;

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




