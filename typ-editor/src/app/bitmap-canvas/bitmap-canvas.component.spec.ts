import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitmapCanvasComponent } from './bitmap-canvas.component';

describe('BitmapCanvasComponent', () => {
  let component: BitmapCanvasComponent;
  let fixture: ComponentFixture<BitmapCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BitmapCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BitmapCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
