import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResizePolylineComponent } from './resize-polyline.component';

describe('ResizePolylineComponent', () => {
  let component: ResizePolylineComponent;
  let fixture: ComponentFixture<ResizePolylineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResizePolylineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResizePolylineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
