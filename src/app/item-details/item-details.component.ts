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
      this.sub = this._Activatedroute.paramMap.subscribe((params) => {
      this.id = params.get('id');
      
      getFile(this.googleApiService, this.id)
      .then((file) => {
        this.file = file;
      })
      .catch((error) => {
        console.error(error);
      });

      this.googleApiService.listActivities(this.id)
      .then(async (res: any) => {
        let filtered = res.filter((obj: any) => obj.primaryActionDetail.permissionChange !== undefined);
        filtered.sort((a: any, b: any) =>{
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        })
        this.nodes = this.getNodes(this.file)
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

  getNodes(file: any): any{
    let temp: any[] = []
    file.permissions?.forEach((p: any, i: number) => {
      let name = p.id === 'anyoneWithLink' ? "Anyone with link" : p.displayName || "Unknown user"
      temp.push({
        id: i, 
        label: name + '\n' + (p.role), 
        image: p.photoLink ?? 'https://lh3.googleusercontent.com/a/default-user=s64', 
        title: p.id === 'anyoneWithLink' ? "Anyone with link" : p.emailAddress || "Unknown email address" 
      })
    });
    return temp;
  }

  getEdges(): any{
    return[
      { from: '1', to: '5' },
      { from: '1', to: '6' },
      { from: '1', to: '3' },
      { from: '3', to: '4' },
      { from: '3', to: '2' }
    ]
  }
}

async function getFile(googleApiService: GoogleAPIService, id: string) : Promise<gapi.client.drive.File>{
  let file : any =  await googleApiService.getFile(id);
  if (!file) {
    throw new Error('File not found');
  }
  return file;
}


