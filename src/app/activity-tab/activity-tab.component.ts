import { Component, Input, OnInit } from '@angular/core';
import { GoogleAPIService } from '../google-api.service';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';

@Component({
  selector: 'app-activity-tab',
  templateUrl: './activity-tab.component.html',
  styleUrls: ['./activity-tab.component.scss']
})
export class ActivityTabComponent {
  @Input() id: any;
  activities: any;
  past_tense: Map<string, string> = new Map();
  isLoading: boolean = true;
  displayedColumns: string[] = ['node'];


  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      date: node.date,
      image: node.image,
      email: node.email,
      hasParent: node.hasParent
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
    node => Array.isArray(node.children) ? node.children : [],
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


  ngOnInit(): void {
    this.googleApiService.listActivities(this.id)
      .then(async (res: any) => {
        console.log(res);
        const pageSize = 10;
        const pageIndex = 0;
        const activities = await this.formatActivities(res,pageIndex,pageSize);
        const remainingActivities = activities.slice(pageSize);
        this.dataSource.data = activities;
        this.isLoading = false;
      })
      .catch((error: any) => {
        console.error(error);
        this.isLoading = false;
      });
  }

  //used in conjunction with the userInfo method in the googleApiService in order to get user informartion through contacts
  //people API requires users to be in your contacts before giving you access to their information 
  async formatActivities(activities: any[], pageIndex: number, pageSize: number): Promise<any[]>{
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
  
    const temp: any[] = [];
  
    const visibleActivities = activities.slice(startIndex, endIndex);
    for (const a of visibleActivities) {
      let date: string = formatTimestamp(a.timestamp);
  
      if (a.primaryActionDetail["permissionChange"] !== undefined) {
        const person = await this.googleApiService.getUserInfo(a.actors[0].user.knownUser.personName);
        
        if (person !== undefined) {
          temp.push({
            name: person.name + " changed the share settings",
            children: await this.getChildren(a.primaryActionDetail.permissionChange),
            date: date,
            image: person.photoUrl,
            email: person.email,
            hasParent: false
          });
        } else {
          temp.push({
            name: "Unknown user changed the share settings",
            children: await this.getChildren(a.primaryActionDetail.permissionChange),
            date: date,
            image: "",
            email: "",
            hasParent: true
          });
        }
      } else {
        let verb: string | undefined = this.past_tense.get(Object.keys(a.primaryActionDetail)[0]);
        const person = await this.googleApiService.getUserInfo(a.actors[0].user.knownUser.personName);
  
        if (person !== undefined) {
          temp.push({
            name: person.name + " " + verb + " the item",
            children: [],
            date: date,
            image: person.photoUrl,
            email: person.email,
            hasParent: false
          });
        } 
      }
    }
  
    return temp;
  }

  //works similarly to the formatActivities function, but for the child folders rather than the roots.
  async getChildren(a: any) {
    let children: any[] = [];
    for (const key in a) {
      for (const permission of a[key]) {
        let id = '';
        if (permission.user !== undefined && permission.user.knownUser !== undefined) {
          id = permission.user.knownUser.personName;
          const person = await this.googleApiService.getUserInfo(permission.user.knownUser.personName);

          children.push({
            name: capitalizeFirst(key.replace("Permission", " permission")) + ": " + person.name + " (" + capitalizeFirst(permission.role) + ")",
            children: [],
            date: '',
            image: person.photoUrl,
            email: person.email,
            hasParent: true
          });
        }
        else{
          children.push({
            name: capitalizeFirst(key.replace("Permission", " permission")) + ": " + 'Anyone with link' + " (" + capitalizeFirst(permission.role) + ")",
            children: [],
            date: '',
            image: 'https://lh3.googleusercontent.com/a/default-user=s64',
            email: '',
            hasParent: true
          });
        }
      }
      return children;
    }
    return "Unknown user";
  }   
}  

function formatTimestamp(date: string): string{
  let options: any = { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "numeric"};
  return new Date(date).toLocaleDateString(undefined, options);
}

function capitalizeFirst(s: string){
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
