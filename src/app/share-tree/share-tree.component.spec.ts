import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareTreeComponent } from './share-tree.component';

describe('ShareTreeComponent', () => {
  let component: ShareTreeComponent;
  let fixture: ComponentFixture<ShareTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareTreeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
