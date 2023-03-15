import { TestBed } from '@angular/core/testing';

import { GoogleAPIService } from './google-api.service';

describe('GoogleCredentialsService', () => {
  let service: GoogleAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
