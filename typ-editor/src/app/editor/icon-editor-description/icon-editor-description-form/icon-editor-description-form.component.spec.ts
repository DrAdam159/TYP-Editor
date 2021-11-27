import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconEditorDescriptionFormComponent } from './icon-editor-description-form.component';

describe('IconEditorDescriptionFormComponent', () => {
  let component: IconEditorDescriptionFormComponent;
  let fixture: ComponentFixture<IconEditorDescriptionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconEditorDescriptionFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconEditorDescriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
