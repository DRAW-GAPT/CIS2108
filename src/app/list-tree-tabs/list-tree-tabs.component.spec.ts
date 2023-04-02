import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTreeTabsComponent } from './list-tree-tabs.component';

describe('ListTreeTabsComponent', () => {
  let component: ListTreeTabsComponent;
  let fixture: ComponentFixture<ListTreeTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListTreeTabsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTreeTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
