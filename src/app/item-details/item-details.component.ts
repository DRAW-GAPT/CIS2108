import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GoogleAPIService } from '../google-api.service';


@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent {
  constructor(
    private _Activatedroute: ActivatedRoute,
    private _router: Router,
    public googleApiService: GoogleAPIService
  ) {}

  @Input() file: any;
  nodes: any;
  edges: any;
  sub: any;
  id: any;


  async ngOnInit() {
      this.sub = this._Activatedroute.paramMap.subscribe(async (params) => {
      this.id = params.get('id');
      
      getFile(this.googleApiService, this.id)
      .then((file) => {
        this.file = file;
      })
      .catch((error) => {
        console.error(error);
      });

      await this.googleApiService.listActivities(this.id)
      .then(async (res: any) => {
        this.nodes = await this.getNodes(res)
        this.edges = this.getEdges(res)        
      })
      .catch((error: any) => {
        console.error(error);
      });
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  //nodes nodes nodes
  async getNodes(activities: any): Promise<any>{
    // activities contains only permission changes and is sorted by least recent 
    let filtered = this.formatActivities(activities)
    let nodes = new Map<string, any>();
    
    for(const activity of filtered) {
      // The original owner/person who shared the file
      const person = await this.googleApiService.getUserInfo(activity.actors[0].user.knownUser.personName) 
  
      if (!nodes.has(activity.actors[0].user.knownUser.personName)) {
        nodes.set(activity.actors[0].user.knownUser.personName, 
          {
            id: activity.actors[0].user.knownUser.personName,
            label: person.name + '\nOwner', 
            image: person.photoUrl,
            title: person.email,
            role: 'Owner'
          }
        )
      }
  
      // iterating over recipients of shares
      for (const key in this.reverseObject(activity.primaryActionDetail.permissionChange)) {
        const permissions = activity.primaryActionDetail.permissionChange[key];

        for (let i = 0; i < permissions.length; i++) {
          const permission = permissions[i];

          if (permission.user === undefined) {
            nodes.set("anyone", {
              id: "anyone",
              label: 'Anyone with link',
              image: 'https://lh3.googleusercontent.com/a/default-user=s64',
              title: 'Anyone with the link can access this item',
              role: 'anyone'
            });

            //actual users
          } else if (permission.user.knownUser.personName) {
            const person = await this.googleApiService.getUserInfo(permission.user.knownUser.personName);
      
            nodes.set(permission.user.knownUser.personName, {
              id: permission.user.knownUser.personName,
              label: person.name + '\n' + this.capitaliseFirstLetter(permission.role),
              image: person.photoUrl,
              title: person.email,
              role: permission.role
            });
          }
        }
      }
    }

    // handles unshared files by displaying the original owner- 
    // useful for files that are in shared folders but the file itself has not been shared
    if(Array.from(nodes.values()).length === 0){

      const person = await this.googleApiService.getUserInfo(activities[activities.length-1].actors[0].user.knownUser.personName) 
      nodes.set(activities[0].actors[0].user.knownUser.personName, 
        {
          id: activities[0].actors[0].user.knownUser.personName,
          label: person.name + '\nOwner', 
          image: person.photoUrl,
          title: person.email,
          role: 'Owner'
        }
      )
    }
    return Array.from(nodes.values());
  }

  getEdges(activities: any): any{
    // activities contains only permission changes and is sorted by least recent 
    let filtered = this.formatActivities(activities)
    console.log(filtered)
    let edges: any[] = [];
    
    for(const activity of filtered) {
      const sharer: any = activity.actors[0].user.knownUser.personName
      // reverse is done because the when a permission is updated, the API first gives removes than additions
      for (const key in this.reverseObject(activity.primaryActionDetail.permissionChange)) {
        let changeType = activity.primaryActionDetail.permissionChange[key];
        for (let i = 0; i < changeType.length; i++) {
          const change = changeType[i];
          // enabled link sharing
          if (key === "addedPermissions" && change.user === undefined) {
            edges.push({from: sharer, to: 'anyone'});
          }
          // disabled link sharing
          else if(key === "removedPermissions" && change.user === undefined){
            this.updateEdgesOutline(sharer, "anyone", true, edges)

          }
          else{
            const recipient = change.user.knownUser.personName ?? "undefined"
            // item has been shared with a new user
            if(key === "addedPermissions" && this.edgeExists(sharer, recipient, edges) === false){
              edges.push({from: sharer, to: recipient})
            }
            // existing's user permission has been removed by a user who didn't give them permission
            else if(key === "removedPermissions" && this.edgeExists(sharer, recipient, edges) === false){
              edges.push({from: sharer, to: recipient, dashes: [5,5]})
            }
            // user's access permissions have been edited (not removed)
            else if(key === "addedPermissions" && this.edgeExists(sharer, recipient, edges)){
              this.updateEdgesOutline(sharer, recipient, false, edges)
            }
            // user's access has been removed by the person who gave them permissions
            else if (key === "removedPermissions"  && this.edgeExists(sharer, recipient, edges) === true){
              this.updateEdgesOutline(sharer, recipient, true, edges)
            }
          }
        }
      }
    }

    
    this.updateNodeOutlines(edges)
    console.log(this.nodes)
    console.log(edges)
    return edges;
  }

  capitaliseFirstLetter(s: string): string{
    let temp = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    return temp
  }

  updateNodeOutlines(edges: any){
    this.nodes.forEach((n: any) => {
      if(n.role !== 'Owner'){
        n.borderWidth = 5
        n.shapeProperties = {borderDashes: [5, 5, 5, 5]} 
      }
      edges.forEach((e: any) => {
        if(e.to === n.id && !e.dashes){
          n.borderWidth = 1
          delete n.shapeProperties;
        }
        else if (e.to === n.id && e.dashes){
          n.borderWidth = 5
          n.shapeProperties = {borderDashes: [5, 5, 5, 5]} 
        }
      });
    });
  }

  edgeExists(sharer: string, recipient: string, edges: any): boolean{
    let exists: boolean = false
    edges.forEach((e: any) => {
      if(e.from === sharer && e.to === recipient){ exists = true }
    });
    return exists
  }

  updateEdgesOutline(sharer: string, recipient: string, dashed: boolean, edges: any): void{
    edges.forEach((e: any) => {
      if(e.from === sharer && e.to === recipient){
        if(dashed){
          e.dashes = [5, 5]
        }
        else{
          delete e.dashes
        }
      }
    });
  }
  
  reverseObject(obj: any): any{
    const reversedObject: { [key: string]: number } = {};
    Object.keys(obj).reverse().forEach(key => {
      reversedObject[key] = obj[key];
    });

    return reversedObject
  }
  
  formatActivities(arr: any): any{
    let filtered = arr.filter((obj: any) => obj.primaryActionDetail.permissionChange !== undefined);
    filtered.sort((a: any, b: any) =>{
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    })
    return filtered
  }
}

async function getFile(googleApiService: GoogleAPIService, id: string) : Promise<gapi.client.drive.File>{
  let file : any =  await googleApiService.getFile(id);
  if (!file) {
    throw new Error('File not found');
  }
  return file;
}

