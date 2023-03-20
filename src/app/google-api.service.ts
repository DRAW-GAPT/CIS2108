import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../environments/environment';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';


const googleAPIKey:string = environment.googleAPIKey;
const googleClientID:string = environment.googleClientID;




@Injectable({
  providedIn: 'root'
})
export class GoogleAPIService {

  gapiInited: Promise<boolean>;
  gisInited: Promise<boolean>;


  allInited: Promise<boolean>



  tokenClient:any = null;
  

  constructor(private cookie: CookieService) {
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

      if(this.cookie.get("googleAuthToken")){
        const tokenToken = JSON.parse(this.cookie.get("googleAuthToken"));
        // TO DO: causes null exception
        gapi.client.setToken(tokenToken);
        console.log(tokenToken);
      }
      resolve(a && b);


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
      discoveryDocs: [DISCOVERY_DOC],
    });
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



  async login(onSuccess:()=>void){

    await this.allInited;

    if(this.cookie.get("googleAuthToken")){




    }
    this.tokenClient.callback = async (resp:any) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
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

  async getAllFiles():Promise<gapi.client.drive.File[]>{
    
    await this.allInited;

    let response;
    try {
      response = await gapi.client.drive.files.list({
        'pageSize': 1000,
        'fields': 'files(id, name, createdTime, modifiedTime, owners,size, lastModifyingUser, iconLink)',
      });
    } catch (err) {
      //todo, error handling
      //document.getElementById('content').innerText = err.message;
      return [];
    }
    const files = response.result.files;
    if (!files || files.length == 0) {
      //todo, error handling
      //document.getElementById('content').innerText = 'No files found.';
      return [];
    }
    // Flatten to string to display
    return files;
  }
  

}
