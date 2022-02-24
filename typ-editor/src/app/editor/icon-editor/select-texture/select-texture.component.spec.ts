import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTextureComponent } from './select-texture.component';

describe('SelectTextureComponent', () => {
  let component: SelectTextureComponent;
  let fixture: ComponentFixture<SelectTextureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectTextureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTextureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
