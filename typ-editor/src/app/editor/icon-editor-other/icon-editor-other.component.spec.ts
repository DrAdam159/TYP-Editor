import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconEditorOtherComponent } from './icon-editor-other.component';

describe('IconEditorOtherComponent', () => {
  let component: IconEditorOtherComponent;
  let fixture: ComponentFixture<IconEditorOtherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconEditorOtherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconEditorOtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
