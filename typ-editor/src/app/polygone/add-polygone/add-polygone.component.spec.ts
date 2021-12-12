import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPolygoneComponent } from './add-polygone.component';

describe('AddPolygoneComponent', () => {
  let component: AddPolygoneComponent;
  let fixture: ComponentFixture<AddPolygoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPolygoneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPolygoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
