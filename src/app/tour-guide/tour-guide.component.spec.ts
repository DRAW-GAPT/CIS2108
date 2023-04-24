import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourGuideComponent } from './tour-guide.component';

describe('TourGuideComponent', () => {
  let component: TourGuideComponent;
  let fixture: ComponentFixture<TourGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TourGuideComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
