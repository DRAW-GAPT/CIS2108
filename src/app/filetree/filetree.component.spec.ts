import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiletreeComponent } from './filetree.component';

describe('FiletreeComponent', () => {
  let component: FiletreeComponent;
  let fixture: ComponentFixture<FiletreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiletreeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiletreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
