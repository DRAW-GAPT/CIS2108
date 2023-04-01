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

export class Node{
  constructor(
    public id:string,
    public displayText:string,
    public level = 1,
    public expandable = false,
    public isLoading = false,
  ){}
}

export class RootNode extends Node{
  constructor(
    id:string,
    displayText:string,
    level = 1,
  ){
    super(id,displayText,level,true)
  }
}

export class FileNode extends Node{
  constructor(
    file:gapi.client.drive.File,
    level = 1,
    expandable = false
  ){
    super(file?.id??"",file?.name??"",level,expandable)
  }
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable({providedIn: 'root'})
export class DynamicDatabase {
  dataMap = new Map<string, string[]>([
    ['Fruits', ['Apple', 'Orange', 'Banana']],
    ['Vegetables', ['Tomato', 'Potato', 'Onion']],
    ['Apple', ['Fuji', 'Macintosh']],
    ['Onion', ['Yellow', 'White', 'Purple']],
  ]);

  constructor (public googleApiService:GoogleAPIService){}

  rootLevelNodes: string[] = ['My Drive', 'Shared with me'];

  /** Initial data from database */
  async initialData(): Promise<Node[]> {
    // return [
    //   new RootNode("myDrive","my drive"),      
    //   new RootNode("sharedWithMe","shared with me"),
    // ]
    return (await getRoots(this.googleApiService)).map(

      //fixme
      f => new FileNode(f, 1, true),
    );;
  }

  async getChildren(node: string): Promise<gapi.client.drive.File[]> {
    return getRoots(this.googleApiService)
  }

  isExpandable(node: string): boolean {
    return this.dataMap.has(node);
  }
}
/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory. For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
export class DynamicDataSource implements DataSource<Node> {
  dataChange = new BehaviorSubject<Node[]>([]);

  get data(): Node[] {
    return this.dataChange.value;
  }
  set data(value: Node[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<Node>,
    private _database: DynamicDatabase,
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<Node[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if (
        (change as SelectionChange<Node>).added ||
        (change as SelectionChange<Node>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<Node>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<Node>) {
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
  async toggleNode(node: Node, expand: boolean) {
    const children = this._database.getChildren(node.id);
    const index = this.data.indexOf(node);
    if (!children || index < 0) {
      // If no children, or cannot find the node, no op
      return;
    }

    node.isLoading = true;

    
    if (expand) {
      const nodes = (await children).map(

        //fixme
        f => new FileNode(f, node.level + 1, this._database.isExpandable(f.id??"")),
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



    this.treeControl = new FlatTreeControl<Node>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database);

    this.setInitialData(googleApiService,database)
  }

  async setInitialData( googleApiService:GoogleAPIService,database: DynamicDatabase){
    console.log("here")

    let f = await googleApiService.getFile("1WXbCnNCEjLUR5DMVvV4BMwaTHMVuqAnQ");
    if(f)
      getRoot(googleApiService,f)

    this.dataSource.data = await database.initialData();
  }

  treeControl: FlatTreeControl<Node>;

  dataSource: DynamicDataSource;

  getLevel = (node: Node) => node.level;

  isExpandable = (node: Node) => node.expandable;

  hasChild = (_: number, _nodeData: Node) => _nodeData.expandable;
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

  if(root.mimeType != "application/vnd.google-apps.folder")
    return []

  console.log("getting children of ",root)

	let result:gapi.client.drive.File[] = []

	let items = await googleApiService.getFiles([],1000,"'"+root.id+"' in parents",undefined);

  for (const f of items.files) {
      if(f.mimeType == "application/vnd.google-apps.folder"){
        let subRoot = await googleApiService.getFile(f.parents?.[0]??"");
        if(subRoot)
          result = [...result,...await getChildren(googleApiService,subRoot)]
      } else{
        result.push(f)
      }
  }

	return result;

}