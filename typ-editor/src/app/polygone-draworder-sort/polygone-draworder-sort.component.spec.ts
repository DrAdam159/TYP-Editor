import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolygoneDraworderSortComponent } from './polygone-draworder-sort.component';

describe('PolygoneDraworderSortComponent', () => {
  let component: PolygoneDraworderSortComponent;
  let fixture: ComponentFixture<PolygoneDraworderSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolygoneDraworderSortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolygoneDraworderSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
