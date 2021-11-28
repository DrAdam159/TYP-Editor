import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconEditorTypeComponent } from './icon-editor-type.component';

describe('IconEditorTypeComponent', () => {
  let component: IconEditorTypeComponent;
  let fixture: ComponentFixture<IconEditorTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconEditorTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconEditorTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
