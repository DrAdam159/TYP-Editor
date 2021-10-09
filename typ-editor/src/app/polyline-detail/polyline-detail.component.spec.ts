import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolylineDetailComponent } from './polyline-detail.component';

describe('PolylineDetailComponent', () => {
  let component: PolylineDetailComponent;
  let fixture: ComponentFixture<PolylineDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolylineDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolylineDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
