import {CollectionViewer, SelectionChange, DataSource} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Injectable} from '@angular/core';
import * as _ from 'lodash';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { GoogleAPIService } from '../google-api.service';

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
export class DynamicDatabase {

  constructor (public googleApiService:GoogleAPIService){}

  /** Initial data from database */
  async initialData(): Promise<FileNode[]> {
    // return [
    //   new RootNode("myDrive","my drive"),      
    //   new RootNode("sharedWithMe","shared with me"),
    // ]
    return (await getRoots(this.googleApiService)).map(

      //fixme
      f => new FileNode(f, 1, f.mimeType == "application/vnd.google-apps.folder"),
    );;
  }

  async getChildren(node: string): Promise<gapi.client.drive.File[]> {
    return getRoots(this.googleApiService)
  }

  isExpandable(node: gapi.client.drive.File): boolean {
    return node.mimeType == "application/vnd.google-apps.folder";
  }
}
/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
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
    private googleApiService: GoogleAPIService,
    private _treeControl: FlatTreeControl<FileNode>,
    private _database: DynamicDatabase,
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<FileNode[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if (
        (change as SelectionChange<FileNode>).added ||
        (change as SelectionChange<FileNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<FileNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<FileNode>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach(node => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  async toggleNode(node: FileNode, expand: boolean) {
    const children = getChildren(this.googleApiService,node.file)
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
  constructor(database: DynamicDatabase, googleApiService:GoogleAPIService) {



    this.treeControl = new FlatTreeControl<FileNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(googleApiService, this.treeControl, database);

    this.setInitialData(googleApiService,database)
  }

  async setInitialData( googleApiService:GoogleAPIService,database: DynamicDatabase){
    this.dataSource.data = await database.initialData();
  }

  treeControl: FlatTreeControl<FileNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: FileNode) => node.level;

  isExpandable = (node: FileNode) => node.file.mimeType == "application/vnd.google-apps.folder";

  hasChild = (_: number, _nodeData: FileNode) => _nodeData.expandable;
}

async function getRoots(googleApiService: GoogleAPIService) {
  
  let files:gapi.client.drive.File[] = (await (googleApiService.getFiles([],1000))).files;

  let roots = await Promise.all(files.map(f=>getRoot(googleApiService,f)))

  console.log("getting roots");

  let uniqRoots = _.uniqBy(roots,'id');

  return uniqRoots;
}


async function getRoot(googleApiService: GoogleAPIService,file:gapi.client.drive.File):Promise<gapi.client.drive.File>{
	if(file.parents == null){
		return file;
	} 
	else{
    let parent = await googleApiService.getFile(file.parents[0])
    if(parent != null)
      return getRoot(googleApiService,parent)
    else{
      console.error("lost parent")
      return file;
    }
	} 
}


async function getChildren(googleApiService: GoogleAPIService, root:gapi.client.drive.File){

  console.log("children of ",root.name)

  if(root.mimeType != "application/vnd.google-apps.folder")
    return []

	let result:gapi.client.drive.File[] = []

	let items = await googleApiService.getFiles([],1000,"'"+root.id+"' in parents",undefined);

  for (const f of items.files) {
      if(f.mimeType == "application/vnd.google-apps.folder"){
        result = [...result,...await getChildren(googleApiService,f)]
      } else{
        result.push(f)
      }
  }

	return result;

}