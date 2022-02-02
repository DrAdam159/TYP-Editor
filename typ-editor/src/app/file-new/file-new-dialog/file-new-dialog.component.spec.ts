import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileNewDialogComponent } from './file-new-dialog.component';

describe('FileNewDialogComponent', () => {
  let component: FileNewDialogComponent;
  let fixture: ComponentFixture<FileNewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileNewDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileNewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
