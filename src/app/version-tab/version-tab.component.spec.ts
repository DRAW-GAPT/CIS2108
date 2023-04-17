import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionTabComponent } from './version-tab.component';

describe('VersionTabComponent', () => {
  let component: VersionTabComponent;
  let fixture: ComponentFixture<VersionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VersionTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VersionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
