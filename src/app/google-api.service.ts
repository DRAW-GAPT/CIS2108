import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';


const googleAPIKey:string = environment.googleAPIKey;
const googleClientID:string = environment.googleClientID;


let gapiInited:boolean = false;
let gisInited:boolean = false;

@Injectable({
  providedIn: 'root'
})
export class GoogleAPIService {



  tokenClient:any = null;
  

  constructor() {
    this.gapiLoaded();
    this.gisLoaded();
  }

  /**
   * Callback after api.js is loaded.
   */
  gapiLoaded() {
    gapi.load('client', this.initializeGapiClient);
  }

  /**
   * Callback after the API client is loaded. Loads the
   * discovery doc to initialize the API.
   */
  async initializeGapiClient() {
    await gapi.client.init({
       apiKey: googleAPIKey,
      discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
  }

  /**
   * Callback after Google Identity Services are loaded.
   */
  gisLoaded() {
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: googleClientID,
      scope: SCOPES,
      callback: ()=>{}, // defined later
    });
    gisInited = true;
  }



  login(onSuccess:()=>void){
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
    let response;
    try {
      response = await gapi.client.drive.files.list({
        'pageSize': 1000,
        'fields': 'files(id, name)',
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
