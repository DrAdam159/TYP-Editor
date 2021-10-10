import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolygoneDetailComponent } from './polygone-detail.component';

describe('PolygoneDetailComponent', () => {
  let component: PolygoneDetailComponent;
  let fixture: ComponentFixture<PolygoneDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolygoneDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolygoneDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
