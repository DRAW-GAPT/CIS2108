import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentlyAccessedComponent } from './recently-accessed.component';

describe('RecentlyAccessedComponent', () => {
  let component: RecentlyAccessedComponent;
  let fixture: ComponentFixture<RecentlyAccessedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecentlyAccessedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentlyAccessedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
