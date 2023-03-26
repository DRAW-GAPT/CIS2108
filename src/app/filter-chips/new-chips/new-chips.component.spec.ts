import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChipsComponent } from './new-chips.component';

describe('NewChipsComponent', () => {
  let component: NewChipsComponent;
  let fixture: ComponentFixture<NewChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewChipsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
