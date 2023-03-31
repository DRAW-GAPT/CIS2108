import {CollectionViewer, SelectionChange, DataSource} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Injectable} from '@angular/core';
import * as _ from 'lodash';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { GoogleAPIService } from '../google-api.service';

/** Flat node with expandable and level information */
export class DynamicFlatNode {
  constructor(
    public item: gapi.client.drive.File,
    public level = 1,
    public expandable = false,
    public isLoading = false,
  ) {}
}

export class DynamicDataSource implements DataSource<DynamicFlatNode> {
  dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);

  get data(): DynamicFlatNode[] {
    return this.dataChange.value;
  }
  set data(value: DynamicFlatNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<DynamicFlatNode>,
    private _database: DynamicDatabase,
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if (
        (change as SelectionChange<DynamicFlatNode>).added ||
        (change as SelectionChange<DynamicFlatNode>).removed
      ) {
        // this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  /** Handle expand/collapse behaviors */
  // handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
  //   if (change.added) {
  //     change.added.forEach(node => this.toggleNode(node, true));
  //   }
  //   if (change.removed) {
  //     change.removed
  //       .slice()
  //       .reverse()
  //       .forEach(node => this.toggleNode(node, false));
  //   }
  // }

  /**
   * Toggle the node, remove from display list
   */
  // toggleNode(node: DynamicFlatNode, expand: boolean) {
  //   // const children = this._database.getChildren(node.item);
  //   const index = this.data.indexOf(node);
  //   if (!children || index < 0) {
  //     // If no children, or cannot find the node, no op
  //     return;
  //   }

  //   node.isLoading = true;

  //     if (expand) {
  //       const nodes = children.map(
  //         name => new DynamicFlatNode(name, node.level + 1, this._database.isExpandable(name)),
  //       );
  //       this.data.splice(index + 1, 0, ...nodes);
  //     } else {
  //       let count = 0;
  //       for (
  //         let i = index + 1;
  //         i < this.data.length && this.data[i].level > node.level;
  //         i++, count++
  //       ) {}
  //       this.data.splice(index + 1, count);
  //     }

  //     // notify the change
  //     this.dataChange.next(this.data);
  //     node.isLoading = false;
  //   }
}

//replace with gapi
@Injectable({providedIn: 'root'})
export class DynamicDatabase {

  constructor(private googleApiService:GoogleAPIService){}

  dataMap = new Map<string, string[]>([
    ['Fruits', ['Apple', 'Orange', 'Banana']],
    ['Vegetables', ['Tomato', 'Potato', 'Onion']],
    ['Apple', ['Fuji', 'Macintosh']],
    ['Onion', ['Yellow', 'White', 'Purple']],
  ]);

  rootLevelNodes: Promise<gapi.client.drive.File[]> = getRoots(this.googleApiService);

  /** Initial data from database */
  async initialData(): Promise<DynamicFlatNode[]> {
    return (await this.rootLevelNodes).map(f => new DynamicFlatNode(f, 0, true));
  }

  // getChildren(node: string): string[] | undefined {
  //   return this.dataMap.get(node);
  // }

  // isExpandable(node: string): boolean {
  //   return this.dataMap.has(node);
  // }
}

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

@Component({
  selector: 'app-filetree',
  templateUrl: './filetree.component.html',
  styleUrls: ['./filetree.component.scss']
})
export class FiletreeComponent {
  constructor(database: DynamicDatabase) {
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database);

    this.dataSource.data = database.initialData();
  }

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;
  
}

async function getRoots(googleApiService: GoogleAPIService) {
  return await googleApiService.getFiles([],1000).then(files => {
    return _.uniqBy(files.files.map(async f=>(await getRoot(googleApiService,f))),'id');
  });
}


async function getRoot(googleApiService: GoogleAPIService,file:gapi.client.drive.File):Promise<gapi.client.drive.File>{
	if(file.parents == null){
		return file;
	} 
	else{
    let parent = await googleApiService.getFile(file.parents[0])
    if(parent != null)
      getRoot(googleApiService,parent)
    else
      console.error("lost parent")
      return file;
	} 
}

