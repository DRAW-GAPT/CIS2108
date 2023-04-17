import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemTabsComponent } from './item-tabs.component';

describe('ItemTabsComponent', () => {
  let component: ItemTabsComponent;
  let fixture: ComponentFixture<ItemTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemTabsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
