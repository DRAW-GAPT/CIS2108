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
        this.edges = this.getEdges()        
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
            title: 'TITLE',
            outline: 'solid'
          }
        )
      }
  
      // iterating over recipients of shares
      for (const key in activity.primaryActionDetail.permissionChange) {
        const permissions = activity.primaryActionDetail.permissionChange[key];

        for (let i = 0; i < permissions.length; i++) {
          const permission = permissions[i];

          if (permission.user === undefined) {
            nodes.set("anyone", {
              id: "anyone",
              label: 'Anyone with link',
              image: 'https://lh3.googleusercontent.com/a/default-user=s64',
              title: 'Anyone with the link can access this item',
              outline: 'solid'
            });

            //actual users
          } else if (permission.user.knownUser.personName) {
            const person = await this.googleApiService.getUserInfo(permission.user.knownUser.personName);
      
            nodes.set(permission.user.knownUser.personName, {
              id: permission.user.knownUser.personName,
              label: person.name + '\n' + permission.role,
              image: person.photoUrl,
              title: person.email,
              outline: 'solid'
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
          title: 'TITLE',
          outline: 'solid'
        }
      )
    }
    return Array.from(nodes.values());
  }

  getEdges(): any{
    return[
      // { from: '1', to: '2' },
      // { from: '1', to: '3' },
      // { from: '1', to: '3' },
      // { from: '3', to: '4' },
      // { from: '2', to: '3' }
    ]
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


