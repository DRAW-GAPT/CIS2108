import { Component, OnInit } from '@angular/core';
import { GoogleAPIService } from '../google-api.service';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

@Component({
  selector: 'app-activity-tab',
  templateUrl: './activity-tab.component.html',
  styleUrls: ['./activity-tab.component.scss']
})
export class ActivityTabComponent {
  activities: any;
  past_tense: Map<string, string> = new Map();

  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      date: node.date
    };
  }

  treeControl = new FlatTreeControl<any>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  hasChild = (_: number, node: any) => node.expandable;

  constructor(
    public googleApiService: GoogleAPIService,
  ) {
    this.past_tense.set("edit", "edited"),
    this.past_tense.set("create", "created"),
    this.past_tense.set("delete", "deleted"),
    this.past_tense.set("move", "moved"),
    this.past_tense.set("restore", "restored"),    
    this.past_tense.set("rename", "renamed")
  }

  
  ngOnInit(): void{
    this.activities = this.googleApiService.listActivities()
    .then((res: any) => {
      this.activities = this.formatActivities(res);
      this.dataSource.data = this.activities;
    })
    .catch((error: any) => {
      console.error(error);
    });
  } 

  formatActivities(activities: any[]): any{
    let temp: any[] = [];
    // activities = [activities[0]];
    activities.forEach(a => {
      let date: string = formatTimestamp(a.timestamp);
      if (a.primaryActionDetail["permissionChange"] !== undefined) {
        temp.push({
          name: a.actors[0].user.knownUser.personName + " changed the share settings",
          children: this.getChildren(a.primaryActionDetail.permissionChange), //expandable node, foreach in permissionChange => {key}: {user} ({role})
          date: date
        });   
      }
      else{
        let verb: string | undefined = this.past_tense.get(Object.keys(a.primaryActionDetail)[0]);
          if(verb !== undefined){
            temp.push({
              name: a.actors[0].user.knownUser.personName + " " + verb + " the item",
              children: [], // node not expandable
              date: date
            }); 
          }
      }
    });
    return temp;
  }

  getChildren(a: any){
    let children: any[] = [];
    for(const key in a){
      a[key].forEach((permission: any) => {
        children.push(
          {
            name: capitalizeFirst(key.replace("Permission", " permission")) + ": " + permission.user.knownUser.personName + "(" + capitalizeFirst(permission.role) + ")", 
            children:[], 
            date: undefined
          }
        );      
      });
    }
    return children;
  }
}

function formatTimestamp(date: string): string{
  let options: any = { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric"};
  return new Date(date).toLocaleDateString(undefined, options);
}

function capitalizeFirst(s: string){
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
