import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDetailsTitleComponent } from './item-details-title.component';

describe('ItemDetailsTitleComponent', () => {
  let component: ItemDetailsTitleComponent;
  let fixture: ComponentFixture<ItemDetailsTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemDetailsTitleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemDetailsTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
