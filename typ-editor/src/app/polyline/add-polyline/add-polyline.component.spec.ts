import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPolylineComponent } from './add-polyline.component';

describe('AddPolylineComponent', () => {
  let component: AddPolylineComponent;
  let fixture: ComponentFixture<AddPolylineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPolylineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPolylineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
