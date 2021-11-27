import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconEditorDescriptionComponent } from './icon-editor-description.component';

describe('IconEditorOtherComponent', () => {
  let component: IconEditorDescriptionComponent;
  let fixture: ComponentFixture<IconEditorDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconEditorDescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconEditorDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
