import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../environments/environment';
import { driveactivity } from 'googleapis/build/src/apis/driveactivity';
import { drive_v3 } from 'googleapis';
import { drive } from 'googleapis/build/src/apis/drive';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/driveactivity/v2/rest',
  'https://people.googleapis.com/$discovery/rest?version=v1'
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 
  'https://www.googleapis.com/auth/drive.metadata.readonly ' +
  'https://www.googleapis.com/auth/drive.activity.readonly ' +
  'https://www.googleapis.com/auth/userinfo.profile ' +
  'https://www.googleapis.com/auth/contacts ' +
  'https://www.googleapis.com/auth/directory.readonly ' +
  'https://www.googleapis.com/auth/profile.emails.read ' +
  'https://www.googleapis.com/auth/user.emails.read ' +
  'https://www.googleapis.com/auth/userinfo.email ' + 
  'https://www.googleapis.com/auth/userinfo.profile ' +
  'https://www.googleapis.com/auth/drive.readonly';

const googleAPIKey:string = environment.googleAPIKey;
const googleClientID:string = environment.googleClientID;

export interface getFilesResult{
  files:gapi.client.drive.File[]
  nextPageToken:string|undefined;
}
export interface getRecentFilesResult{
  files:gapi.client.drive.File[];
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAPIService {

  gapiInited: Promise<boolean>;
  gisInited: Promise<boolean>;
  allInited: Promise<boolean>;

  tokenClient:any = null;

  constructor(private cookie: CookieService, private router: Router) {
    this.gapiInited = new Promise<boolean>((resolve)=>{
      this.gapiLoaded(resolve);
    });

    this.gisInited = new Promise<boolean>((resolve)=>{
      this.gisLoaded(resolve);
    });

    //promise that returns true when both gapi and gis are loaded
    this.allInited = new Promise(async (resolve)=>{
      var a = await this.gapiInited;
      var b = await this.gisInited;    

      await this.getCookie();
      resolve(a && b);


      //this.getUserInfo("people/108047227550681835497"); //me
      //console.log(this.getUserInfo("people/117534848934012919819")); //wayne
      //console.log(this.getUserInfo("people/105228402161058122242")); //andrea

      //this.getRevisions("1XtikHS01Kl-kKnT9HfLYgavSbknkd42r"); //mine
      //this.getRevisions("1bpf_-tYrJ15ObIXkmjK5KDo_QgdhsT2Zgapxt-aJZM4"); //andrea's shared with me
      //console.log(this.getRevisions("1NVWPmLDQTx7jduWSH6uPFMi3uBRw4vRgsRUV_ENLuqw")); //waynefile
      
      await this.addPeopleToContacts("1SOtm5imnlfwB-O10L9Q2EOdbexraPp94");
    })
  }

  /**
   * Callback after api.js is loaded.
   */
  gapiLoaded(resolve: (value: boolean | PromiseLike<boolean>) => void) {
    gapi.load('client', ()=>this.initializeGapiClient(resolve));
    
  }

  /**
   * Callback after the API client is loaded. Loads the
   * discovery doc to initialize the API.
   */
  async initializeGapiClient(resolve: (value: boolean | PromiseLike<boolean>) => void) {
    await gapi.client.init({
       apiKey: googleAPIKey,
       discoveryDocs: DISCOVERY_DOCS,
    });

    //gapi.client.driveactivity.

    
    resolve(true);
  }

  /**
   * Callback after Google Identity Services are loaded.
   */
  gisLoaded(resolve: (value: boolean | PromiseLike<boolean>) => void) {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: googleClientID,
      scope: SCOPES,
      callback: ()=>{},
    });
    resolve(true)
  }

  async confirmLogin(){
    if(gapi.client.getToken() == null || !this.cookie.get("googleAuthToken")){
      this.router.navigate(['login']);
    }
  }

  async login(onSuccess:()=>void){
    await this.allInited;

    this.tokenClient.callback = async (resp:any) => {
      if (resp.error !== undefined) {
        throw (resp);
      }

      this.createCookie();
      onSuccess();
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      this.tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      this.tokenClient.requestAccessToken({prompt: ''});
    }
  }

  async getFiles(files:gapi.client.drive.File[],limit:number,q:string="",sort:string="",nextPageToken:string|undefined = undefined):Promise<getFilesResult>{

    await this.allInited;
    await this.confirmLogin();

    if(limit > files.length || limit == -1){
    
      try {
        do{
          let response = await gapi.client.drive.files.list({
            'pageSize': 1000,
            'fields': 'nextPageToken, files(id, name,mimeType,parents, createdTime, modifiedTime,modifiedByMeTime,sharedWithMeTime,viewedByMeTime, owners,size, lastModifyingUser, iconLink,fileExtension,permissions,hasAugmentedPermissions, capabilities, ownedByMe, webViewLink)',
            'q': q,
            'orderBy': sort,
            'pageToken': nextPageToken
          });
          nextPageToken = response.result.nextPageToken;
          if(response.result.files)
            files = [...files,...response.result.files]

        } while (nextPageToken != undefined && (files.length < limit || limit == -1))
      } catch (err) {
        //todo, error handling

        return {nextPageToken:undefined,files:[]} ;
      }
    }
    //return the nextpagetoken in case we need more files in the future
    return {nextPageToken:nextPageToken,files:files};
  }


  async getFile(id:string):Promise<gapi.client.drive.File | null>{

    await this.allInited;
    await this.confirmLogin();

    
      try {
          let response = await gapi.client.drive.files.get({
            'fileId':id,
            'fields':"*"
          });
          return response.result;
      } catch (err) {
        //todo, error handling
        return null;
      }
    
  }
    //method used to fetch the top 5 most recently modified files and their attributes for use in the header cards
  async getMostRecent(recentFiles:gapi.client.drive.File[]):Promise<getRecentFilesResult>{
    await this.allInited;
    await this.confirmLogin();

          let response = await gapi.client.drive.files.list({
            'pageSize': 5,
            'fields': 'files(id, name, iconLink , owners, lastModifyingUser, createdTime, modifiedTime)',
            'orderBy': 'createdTime desc',
          });
          if(response.result.files)
          recentFiles = [...recentFiles,...response.result.files];
          
      return {files:recentFiles};
  }

  //uses the cookie storing the google auth token to appease the API
  public async getCookie(): Promise<boolean>{
    await this.gapiInited;
    await this.gisInited;

    if(this.cookie.get("googleAuthToken")){
      const tokenToken = JSON.parse(this.cookie.get("googleAuthToken"));
      gapi.client.setToken(tokenToken);
      return true;
    }
    return false;
  }

  //used to check validation of Google Authentication token by synchronizing cookie expiry with token expiry
  public createCookie(){
    const token = gapi.client.getToken();
    const tokenString = JSON.stringify(token);
    const expiryTime = (JSON.parse(gapi.client.getToken().expires_in) * 1000);

    this.cookie.set('googleAuthToken', tokenString, expiryTime/(86400000), '/');

    setTimeout(() => {
      this.cookie.delete('googleAuthToken');
      this.confirmLogin();
    }, expiryTime);
  }

  async listActivities(fileId:string) {

    await this.gapiInited;
    await this.gisInited;

    let response;
    try {
      response = await gapi.client.driveactivity.activity.query({
        resource: {
          pageSize: 10,
          itemName: "items/" + fileId

        }
      });
    } catch (err) {
      console.error(err);
      return;
    }

    const activities = response?.result?.activities;
    if (!activities || activities.length == 0) {
      return;
    } else {
      return activities;
    }
}
    
  //retrieves user info, requires the user to be in your contacts else only returns their profile picture
  async getUserInfo(userId: string) {

    const res = await gapi.client.people.people.get({
      resourceName: userId,
      personFields: 'names,emailAddresses,photos'
    });
  
    if (res.status === 200 && res.result.names !== undefined && res.result.emailAddresses !== undefined && res.result.photos !== undefined) {
      // const name = res.result.names[0].displayName;
      // const emailAddresses = res.result.emailAddresses[0].value;
      // const photo = res.result.photos[0].url;

      return res.result;
     }
   return false;    
  }

  //Requests a list of file modifications that occured for the file with the id inputted as parameter
  //Requires that you have access to that file 
  async getRevisions(fileId: string) {
    try {
      const revisionsResponse = await gapi.client.drive.revisions.list({
        fileId,
        fields: 'revisions(modifiedTime,lastModifyingUser)',
      });
      
      const revisions = revisionsResponse.result.revisions;
      
      // Iterate through the list of revisions to display the details of the last modifying user
      if(revisions != undefined){
        // console.log("REVISIONS")
        // for (const revision of revisions) {
        //   console.log(`Modified Time: ${revision.modifiedTime}`);
        //   console.log(`Last Modifying User: ${JSON.stringify(revision.lastModifyingUser?.displayName)}`);
        //   console.log(`Last Modifying User email: ${JSON.stringify(revision.lastModifyingUser?.emailAddress)}`);
        //   console.log(`Last Modifying User's pfp: ${JSON.stringify(revision.lastModifyingUser?.photoLink)}`);
        //   console.log("\n");
        // }
        return revisions;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  }

  async addPeopleToContacts(fileId: string): Promise<void> {
    try {
      // Get a list of all people who have shared the file with you and people you've shared the file with
      const permissionListResponse = await gapi.client.drive.permissions.list({
        fileId: fileId,
        fields: 'permissions(id,emailAddress,displayName)',
      });
      const permissionList = permissionListResponse.result.permissions;
      const peopleList = permissionList?.filter(
        (p) => p.id !== 'anyoneWithLink' && p.emailAddress !== ''
      );
  
      // Add each person to your Google Contacts
      if (peopleList != undefined) {
        for (const person of peopleList) {
          const contactListResponse = await gapi.client.people.people.connections.list({
            resourceName: 'people/me',
            personFields: 'emailAddresses',
          });
          const contactList = contactListResponse.result.connections;
  
          // Check if the contact already exists
          const existingContact = contactList?.find(
            (c) => c.emailAddresses?.find((e) => e.value === person.emailAddress) !== undefined
          );
          if (existingContact !== undefined) {
            console.log(`Contact ${person.emailAddress} already exists.`);
            continue;
          }
  
          // Add the new contact
          const newContact: gapi.client.people.Person = {
            names: [
              {
                givenName: person.displayName ?? '',
              },
            ],
            emailAddresses: [
              {
                value: person.emailAddress!,
                type: 'draw',
              },
            ],
          };
          await gapi.client.people.people.createContact({
            resource: newContact,
          });
          console.log(`Contact ${person.emailAddress} added successfully.`);
        }
      }
    } catch (err) {
      console.error(`Error adding contacts: ${err}`);
    }
  }
}
